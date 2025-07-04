use tauri::command;
use std::sync::{Arc, Mutex};
use once_cell::sync::Lazy;

mod serial;
use serial::SerialManager;

mod serialmanager;
use serialmanager::CerialManager;

// The serial manager is a runtime initialised singleton wrapped in Arc and Mutex
// to allow shared ownership and thread-safe access across the tauri application.
static SERIAL_MANAGER: Lazy<Arc<Mutex<CerialManager>>> = Lazy::new(|| {
    Arc::new(Mutex::new(CerialManager::new()))
});

#[command]
fn get_serial_ports() -> Vec<String> {
    SERIAL_MANAGER.lock()
        .ok()
        .and_then(|manager| manager.get_ports().ok())
        .unwrap_or_default()
}

#[command]
fn get_log_chunk(offset: usize, limit: usize) -> Vec<String> {
    (offset..offset + limit)
        .map(|i| format!("Serial Port X, Line {}", i + 1))
        .collect()
}

#[command]
fn get_port_info(port_name: String) -> Result<String, String> {
    let manager = SerialManager::new();
    manager.get_port_info(&port_name)
}

#[command]
fn read_serial_data(port_name: String, baud_rate: u32) -> Result<Vec<String>, String> {
    let manager = SerialManager::new();
    manager.read_from_port(&port_name, baud_rate)
}

#[command]
fn scan_devices() -> Result<Vec<String>, String> {
    serial::scan_for_devices()
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_log_chunk,
            get_serial_ports,
            get_port_info,
            read_serial_data,
            scan_devices
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
