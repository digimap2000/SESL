use tauri::command;
use std::sync::{Arc, Mutex};
use std::thread;
use std::sync::mpsc::{self, Receiver};

// Import from your crate
use serial_manager::{SerialManager, SerialEvent};

/// Starts a background thread that listens for serial device events and prints them to console
fn start_event_listener(receiver: Receiver<SerialEvent>) {
    thread::spawn(move || {
        println!("🎧 Serial device event listener started");
        
        loop {
            // Block and wait for events directly on the receiver
            match receiver.recv() {
                Ok(SerialEvent::DeviceArrived { port_name, timestamp }) => {
                    println!("🔌 Device CONNECTED: {} at {:?}", port_name, timestamp);
                }
                Ok(SerialEvent::DeviceDeparted { port_name, timestamp }) => {
                    println!("🔌 Device DISCONNECTED: {} at {:?}", port_name, timestamp);
                }
                Err(_) => {
                    println!("🔌 Event channel closed, stopping listener");
                    break; // Channel closed, exit gracefully
                }
            }
        }
        
        println!("🎧 Serial device event listener stopped");
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
    start_event_listener(receiver);

    tauri::Builder::default()
        .manage(Arc::new(Mutex::new(manager))) // Tauri's state management
        .invoke_handler(tauri::generate_handler![
            get_serial_ports,
            get_log_chunk
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
