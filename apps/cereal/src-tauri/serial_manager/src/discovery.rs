//! # Serial Port Discovery Service
//! 
//! This module provides automatic background discovery of serial ports connected to the system.
//! The DiscoveryService runs in a separate background thread and continuously monitors for
//! changes to the available serial ports (USB devices being plugged/unplugged, etc.).
//! 
//! ## Key Features
//! 
//! - **Background Monitoring**: Runs in a dedicated thread to avoid blocking the main application
//! - **Real-time Updates**: Checks for port changes every 2 seconds
//! - **Thread-safe Communication**: Uses Arc<Mutex<HashSet<String>>> to share discovered ports
//! - **Event Notifications**: Sends structured events when ports are added or removed
//! - **Graceful Shutdown**: Supports clean termination via atomic boolean flag
//! - **Change Detection**: Logs when ports are added or removed from the system
//! 
//! ## Usage
//! 
//! The service is typically spawned by CerialManager and shares a reference to the known_ports
//! collection. As new serial devices are detected, they're automatically added to the shared
//! collection and events are sent via the event channel.
//! 
//! ```ignore
//! let known_ports = Arc::new(Mutex::new(HashSet::new()));
//! let discovery = DiscoveryService::spawn(known_ports.clone());
//! 
//! // Listen for events
//! while let Ok(event) = discovery.events.recv() {
//!     match event {
//!         PortEvent::Added(port) => println!("Device connected: {}", port),
//!         PortEvent::Removed(port) => println!("Device disconnected: {}", port),
//!     }
//! }
//! ```

use std::{
    collections::HashSet, 
    sync::{Arc, Mutex, atomic::{AtomicBool, Ordering}}, 
    time::Duration,
    thread::{self, JoinHandle}
};
use serialport;

/// Events emitted when serial port status changes
#[derive(Debug, Clone, PartialEq)]
pub enum PortEvent {
    /// A new serial port was detected and added to the system
    Added(String),
    /// A serial port was removed from the system
    Removed(String),
}

/// Callback function type for port change notifications
/// 
/// The callback receives a PortEvent when devices are added or removed.
/// This function should be lightweight as it's called from the discovery thread.
pub type PortEventCallback = Box<dyn Fn(PortEvent) + Send + Sync>;

/// Background service that continuously discovers and monitors serial ports.
/// 
/// This service runs in a separate thread and maintains an up-to-date list of
/// available serial ports by periodically scanning the system. When ports are
/// added or removed, the changes are reflected in the shared known_ports collection
/// and the callback function is invoked.
pub struct DiscoveryService {
    /// Atomic flag used to signal the background thread to shutdown gracefully.
    shutdown: Arc<AtomicBool>,
    
    /// Handle to the background discovery thread (prefixed with _ to indicate intentional non-use).
    _handle: JoinHandle<()>,
}

impl DiscoveryService {
    /// Creates a new DiscoveryService and immediately starts background port discovery.
    /// 
    /// This spawns a background thread that will continuously monitor for serial port
    /// changes and invoke the callback when events occur.
    /// 
    /// # Arguments
    /// 
    /// * `known_ports` - Shared collection that will be updated with discovered port names.
    /// * `callback` - Function to call when ports are added or removed.
    /// 
    /// # Returns
    /// 
    /// A new DiscoveryService instance with an active background monitoring thread.
    /// 
    /// # Example
    /// 
    /// ```rust
    /// let known_ports = Arc::new(Mutex::new(HashSet::new()));
    /// let discovery = DiscoveryService::spawn(
    ///     known_ports.clone(),
    ///     Box::new(|event| {
    ///         match event {
    ///             PortEvent::Added(port) => println!("Device connected: {}", port),
    ///             PortEvent::Removed(port) => println!("Device disconnected: {}", port),
    ///         }
    ///     })
    /// );
    /// ```
    pub fn spawn(
        known_ports: Arc<Mutex<HashSet<String>>>,
        callback: PortEventCallback
    ) -> Self {
        let shutdown = Arc::new(AtomicBool::new(false));
        let shutdown_clone = shutdown.clone();
        let known_ports_clone = known_ports.clone();

        let handle = thread::spawn(move || {
            while !shutdown_clone.load(Ordering::Relaxed) {
                match serialport::available_ports() {
                    Ok(current_ports) => {
                        let current_set: HashSet<String> = current_ports
                            .iter()
                            .map(|p| p.port_name.clone())
                            .filter(|port_name| {
                                // On macOS, prefer cu.* over tty.* for the same device
                                if port_name.contains("/dev/tty.") {
                                    let cu_equivalent = port_name.replace("/dev/tty.", "/dev/cu.");
                                    !current_ports.iter().any(|p| p.port_name == cu_equivalent)
                                } else {
                                    true
                                }
                            })
                            .collect();

                        if let Ok(mut known) = known_ports_clone.lock() {
                            // Notify callback for new ports
                            for p in current_set.difference(&*known) {
                                println!("New port: {}", p);
                                callback(PortEvent::Added(p.clone()));
                            }

                            // Notify callback for removed ports  
                            for p in known.difference(&current_set) {
                                println!("Removed port: {}", p);
                                callback(PortEvent::Removed(p.clone()));
                            }

                            *known = current_set;
                        } else {
                            eprintln!("Failed to lock known ports");
                        }
                    }
                    Err(e) => {
                        eprintln!("Error listing ports: {}", e);
                    }
                }

                // Sleep for 2 seconds, but check shutdown flag more frequently
                for _ in 0..20 {
                    if shutdown_clone.load(Ordering::Relaxed) {
                        break;
                    }
                    thread::sleep(Duration::from_millis(100));
                }
            }
            
            println!("DiscoveryService shutting down");
        });

        DiscoveryService {
            shutdown,
            _handle: handle,
        }
    }

    /// Signals the background discovery thread to shutdown gracefully.
    /// 
    /// This method sets the atomic shutdown flag to true, which will cause the
    /// background thread to exit its monitoring loop and terminate. The shutdown
    /// is asynchronous - this method returns immediately without waiting for the
    /// thread to actually finish.
    /// 
    /// # Thread Safety
    /// 
    /// This method is thread-safe and can be called from any thread. Multiple
    /// calls to shutdown() are safe and will have no additional effect after
    /// the first call.
    /// 
    /// # Timing
    /// 
    /// The background thread checks the shutdown flag every 100ms, so it should
    /// terminate no later than 100ms of calling this method.
    ///
    pub fn shutdown(&self) {
        self.shutdown.store(true, Ordering::Relaxed);
    }
}

impl Drop for DiscoveryService {
    fn drop(&mut self) {
        self.shutdown();
    }
}
