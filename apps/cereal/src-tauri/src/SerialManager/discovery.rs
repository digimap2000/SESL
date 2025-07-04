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
//! - **Graceful Shutdown**: Supports clean termination via atomic boolean flag
//! - **Change Detection**: Logs when ports are added or removed from the system
//! 
//! ## Usage
//! 
//! The service is typically spawned by CerialManager and shares a reference to the known_ports
//! collection. As new serial devices are detected, they're automatically added to the shared
//! collection which can be queried by the main application.
//! 
//! ```rust
//! let known_ports = Arc::new(Mutex::new(HashSet::new()));
//! let discovery = DiscoveryService::spawn(known_ports.clone());
//! // Service runs in background, updating known_ports automatically
//! ```
//! 
//! ## Implementation Notes
//! 
//! - Uses std::thread for background execution (no async runtime required)
//! - Implements responsive shutdown by checking the shutdown flag every 100ms
//! - Falls back gracefully if port enumeration fails
//! - Automatically cleans up on Drop (though thread join is not guaranteed)
//! 
//! ## Thread Safety
//! 
//! All public methods are thread-safe and can be called from any thread. The service
//! uses atomic operations for shutdown signaling and standard Mutex for port collection
//! updates to ensure safe concurrent access.

use std::{
    collections::HashSet, 
    sync::{Arc, Mutex, atomic::{AtomicBool, Ordering}}, 
    time::Duration,
    thread::{self, JoinHandle}
};
use serialport;

/// Background service that continuously discovers and monitors serial ports.
/// 
/// This service runs in a separate thread and maintains an up-to-date list of
/// available serial ports by periodically scanning the system. When ports are
/// added or removed, the changes are reflected in the shared known_ports collection
/// and logged to the console.
pub struct DiscoveryService {
    /// Atomic flag used to signal the background thread to shutdown gracefully.
    /// 
    /// This flag is shared between the main service instance and the background thread.
    /// When set to `true`, the background thread will exit its monitoring loop and
    /// terminate within ~100ms. Uses `Relaxed` ordering since precise synchronization
    /// timing is not critical for shutdown signaling.
    shutdown: Arc<AtomicBool>,
    
    /// Handle to the background discovery thread (prefixed with _ to indicate intentional non-use).
    /// 
    /// This handle maintains ownership of the spawned thread, preventing it from becoming
    /// detached. While we don't explicitly join the thread in our current implementation,
    /// storing the handle serves several important purposes:
    /// 
    /// - **Ownership**: Keeps the thread tied to this service instance's lifetime
    /// - **Resource tracking**: Documents that this struct owns a background thread  
    /// - **Future extensibility**: Allows adding thread join/status methods later
    /// - **Prevention of detachment**: Without this, the thread would become "fire and forget"
    /// 
    /// The underscore prefix follows Rust conventions for "intentionally unused" fields
    /// that are kept for ownership or lifecycle management reasons.
    _handle: JoinHandle<()>,
}

impl DiscoveryService {
    ///
    /// Creates a new DiscoveryService and immediately starts background port discovery.
    /// 
    /// This is a constructor method that both creates the service instance AND spawns
    /// a background thread to begin monitoring serial ports. Unlike a traditional `new()`
    /// method, `spawn()` indicates that background work starts immediately upon creation.
    /// 
    /// # Arguments
    /// 
    /// * `known_ports` - Shared collection that will be updated with discovered port names.
    ///   The background thread will continuously update this collection as ports are
    ///   added or removed from the system.
    /// 
    /// # Returns
    /// 
    /// A new DiscoveryService instance with an active background monitoring thread.
    /// The service will continue running until `shutdown()` is called or the service
    /// is dropped.
    /// 
    /// # Background Behavior
    /// 
    /// The spawned thread will:
    /// - Check for available serial ports every 2 seconds
    /// - Update the shared `known_ports` collection with any changes
    /// - Log new and removed ports to the console
    /// - Respond to shutdown signals within 100ms
    /// 
    /// # Example
    /// 
    /// ```rust
    /// let known_ports = Arc::new(Mutex::new(HashSet::new()));
    /// let discovery = DiscoveryService::spawn(known_ports.clone());
    /// // Background discovery is now active
    /// ```
    pub fn spawn(known_ports: Arc<Mutex<HashSet<String>>>) -> Self {
        let shutdown = Arc::new(AtomicBool::new(false));
        let shutdown_clone = shutdown.clone();
        let known_ports_clone = known_ports.clone();

        let handle = thread::spawn(move || {
            while !shutdown_clone.load(Ordering::Relaxed) {
                // Check for serial ports
                match serialport::available_ports() {
                    Ok(current_ports) => {
                        let current_set: HashSet<String> =
                            current_ports.iter().map(|p| p.port_name.clone()).collect();

                        // Try to lock and update known ports
                        if let Ok(mut known) = known_ports_clone.lock() {
                            // Log new ports
                            for p in current_set.difference(&*known) {
                                println!("New port: {}", p);
                            }

                            // Log removed ports
                            for p in known.difference(&current_set) {
                                println!("Removed port: {}", p);
                            }

                            // Update the known ports
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

    ///
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

///
/// Implements automatic cleanup when the DiscoveryService is dropped.
/// 
/// This ensures that the background discovery thread is properly signaled to shutdown
/// when the DiscoveryService goes out of scope or is explicitly dropped. Without this,
/// the background thread would continue running indefinitely even after the service
/// is no longer needed, leading to resource leaks and unnecessary CPU usage.
/// 
/// # Note
/// 
/// We signal shutdown via the atomic flag but don't join the thread here because:
/// - Drop only gives us `&mut self`, not ownership of the JoinHandle
/// - Joining could block the dropping thread if the background thread is slow to respond
/// - The background thread will terminate on its own once it sees the shutdown flag
/// 
/// In most cases, the thread will exit within 100ms (the sleep interval), making this
/// approach both safe and responsive.
///
impl Drop for DiscoveryService {
    fn drop(&mut self) {
        self.shutdown();
    }
}
