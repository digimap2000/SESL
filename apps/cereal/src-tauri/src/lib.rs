use tauri::{command, AppHandle, Emitter};
use std::sync::{Arc, Mutex};
use std::thread;
use std::sync::mpsc::{self, Receiver};
use serde::{Deserialize, Serialize};

// Import from your crate
use serial_manager::{SerialManager, SerialEvent};

/// Serializable version of SerialEvent for Tauri frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum TauriSerialEvent {
    DeviceArrived { 
        port_name: String, 
        timestamp: u64 // Unix timestamp in milliseconds
    },
    DeviceDeparted { 
        port_name: String, 
        timestamp: u64 
    },
}

impl From<SerialEvent> for TauriSerialEvent {
    fn from(event: SerialEvent) -> Self {
        match event {
            SerialEvent::DeviceArrived { port_name, timestamp } => {
                let timestamp_ms = timestamp
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_millis() as u64;
                
                TauriSerialEvent::DeviceArrived { port_name, timestamp: timestamp_ms }
            },
            SerialEvent::DeviceDeparted { port_name, timestamp } => {
                let timestamp_ms = timestamp
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_millis() as u64;
                
                TauriSerialEvent::DeviceDeparted { port_name, timestamp: timestamp_ms }
            },
        }
    }
}

/// Forwards serial device events to the Tauri frontend
fn start_event_forwarder(app_handle: AppHandle, receiver: Receiver<SerialEvent>) {
    thread::spawn(move || {
        println!("🎧 Serial device event forwarder started");
        
        loop {
            // Block and wait for events directly on the receiver
            match receiver.recv() {
                Ok(event) => {
                    // Convert to serializable format
                    let tauri_event = TauriSerialEvent::from(event.clone());
                    
                    // Log to console for debugging
                    match &event {
                        SerialEvent::DeviceArrived { port_name, timestamp } => {
                            println!("🔌 Device CONNECTED: {} at {:?}", port_name, timestamp);
                        }
                        SerialEvent::DeviceDeparted { port_name, timestamp } => {
                            println!("🔌 Device DISCONNECTED: {} at {:?}", port_name, timestamp);
                        }
                    }
                    
                    // Emit to frontend
                    if let Err(e) = app_handle.emit("serial-device-event", &tauri_event) {
                        eprintln!("Failed to emit serial event: {}", e);
                    }
                }
                Err(_) => {
                    println!("🔌 Event channel closed, stopping forwarder");
                    break; // Channel closed, exit gracefully
                }
            }
        }
        
        println!("🎧 Serial device event forwarder stopped");
    });
}

#[command]
fn get_serial_ports(manager: tauri::State<Arc<Mutex<SerialManager>>>) -> Vec<String> {
    manager.lock().unwrap().get_ports()
}

#[command]
fn get_log_chunk(offset: usize, limit: usize) -> Vec<String> {
    (offset..offset + limit)
        .map(|i| format!("Serial Port X, Line {}", i + 1))
        .collect()
}

pub fn run() {
    let (sender, receiver) = mpsc::channel();
    let manager = SerialManager::new(sender);

    tauri::Builder::default()
        .manage(Arc::new(Mutex::new(manager)))
        .setup(|app| {
            // Start the event forwarder after the app is set up
            start_event_forwarder(app.handle().clone(), receiver);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_serial_ports,
            get_log_chunk
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
