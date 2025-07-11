use std::{collections::HashSet, sync::Arc, sync::Mutex, sync::mpsc::Sender};
use crate::discovery::{DiscoveryService, PortEvent, PortEventCallback};

/// High-level events emitted by the SerialManager
#[derive(Debug, Clone, PartialEq)]
pub enum SerialEvent {
    /// A new serial device was connected and is now available
    DeviceArrived {
        port_name: String,
        /// Timestamp when the device was detected
        timestamp: std::time::SystemTime,
    },
    /// A serial device was disconnected and is no longer available
    DeviceDeparted {
        port_name: String,
        /// Timestamp when the device was removed
        timestamp: std::time::SystemTime,
    },
}

/// High-level interface for serial port management with background discovery.
/// 
/// The SerialManager provides a simple API for accessing discovered serial ports
/// while running a background service to monitor for device changes. Events are
/// sent through the provided sender channel.
pub struct SerialManager {
    known_ports: Arc<Mutex<HashSet<String>>>,
    discovery: DiscoveryService,
}

impl SerialManager {
    /// Creates a new SerialManager with the provided event sender.
    /// 
    /// This allows the caller to control where events are sent and how they are handled.
    /// 
    /// # Arguments
    /// 
    /// * `event_sender` - Channel sender for broadcasting SerialEvents to listeners
    /// 
    /// # Returns
    /// 
    /// A new SerialManager instance that will send events through the provided sender.
    /// 
    /// # Example
    /// 
    /// ```rust
    /// use std::sync::mpsc;
    /// let (sender, receiver) = mpsc::channel();
    /// let manager = SerialManager::new(sender);
    /// 
    /// // Listen for events on the receiver
    /// while let Ok(event) = receiver.recv() {
    ///     println!("Event: {:?}", event);
    /// }
    /// ```
    pub fn new(event_sender: Sender<SerialEvent>) -> Self {
        let known_ports = Arc::new(Mutex::new(HashSet::new()));

        // Create callback that converts PortEvents to SerialEvents
        let callback: PortEventCallback = Box::new(move |port_event| {
            let serial_event = match port_event {
                PortEvent::Added(port_name) => SerialEvent::DeviceArrived {
                    port_name,
                    timestamp: std::time::SystemTime::now(),
                },
                PortEvent::Removed(port_name) => SerialEvent::DeviceDeparted {
                    port_name,
                    timestamp: std::time::SystemTime::now(),
                },
            };
            
            // Send to event sender (ignore if channel is closed or full)
            let _ = event_sender.send(serial_event);
        });

        // Start discovery with callback
        let discovery = DiscoveryService::spawn(known_ports.clone(), callback);

        SerialManager {
            known_ports,
            discovery,
        }
    }

    /// Returns a sorted list of currently available serial port names.
    /// 
    /// This list is maintained by the background discovery service and 
    /// reflects the current state of connected serial devices.
    pub fn get_ports(&self) -> Vec<String> {
        let mut ports: Vec<String> = self.known_ports.lock().unwrap()
            .iter().cloned().collect();
        ports.sort();
        ports
    }

}

impl Drop for SerialManager {
    fn drop(&mut self) {
        self.discovery.shutdown();
    }
}