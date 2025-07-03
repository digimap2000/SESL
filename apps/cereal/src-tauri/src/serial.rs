use serialport::{SerialPortInfo, available_ports};
use std::time::Duration;
use std::io::{self, BufRead, BufReader};

pub struct SerialManager {
    // This would hold your actual serial port connections
    // For now, we'll keep it simple
}

impl SerialManager {
    pub fn new() -> Self {
        SerialManager {}
    }
    
    /// Get a list of available serial ports
    pub fn get_available_ports(&self) -> Result<Vec<String>, String> {
        match available_ports() {
            Ok(ports) => {
                let port_names: Vec<String> = ports
                    .into_iter()
                    .filter_map(|port| {
                        let mut port_name = port.port_name;
                        
                        // Remove any trailing slashes
                        if port_name.ends_with('/') {
                            port_name.pop();
                        }
                        
                        // On macOS, prefer /dev/cu.* devices over /dev/tty.* devices
                        // /dev/cu.* are for outgoing connections (what we want)
                        // /dev/tty.* are for incoming connections
                        if port_name.starts_with("/dev/tty.") {
                            // Skip /dev/tty.* devices on macOS
                            None
                        } else {
                            // Keep Windows COM ports, Linux /dev/ttyUSB*, and macOS /dev/cu.*
                            Some(port_name)
                        }
                    })
                    .collect();
                Ok(port_names)
            }
            Err(e) => Err(format!("Failed to get serial ports: {}", e)),
        }
    }
    
    /// Connect to a serial port and read some data
    pub fn read_from_port(&self, port_name: &str, baud_rate: u32) -> Result<Vec<String>, String> {
        // In a real implementation, you'd open the port and read data
        // For now, let's simulate some data based on the port name
        match serialport::new(port_name, baud_rate)
            .timeout(Duration::from_millis(1000))
            .open()
        {
            Ok(mut port) => {
                // In a real app, you'd read from the port
                // For demo purposes, let's return some mock data
                Ok(vec![
                    format!("Connected to {}", port_name),
                    format!("Baud rate: {}", baud_rate),
                    "Mock data from serial port".to_string(),
                ])
            }
            Err(e) => Err(format!("Failed to open port {}: {}", port_name, e)),
        }
    }
    
    /// Get port information
    pub fn get_port_info(&self, port_name: &str) -> Result<String, String> {
        match available_ports() {
            Ok(ports) => {
                for port in ports {
                    if port.port_name == port_name {
                        return Ok(format!(
                            "Port: {}, Type: {:?}", 
                            port.port_name, 
                            port.port_type
                        ));
                    }
                }
                Err(format!("Port {} not found", port_name))
            }
            Err(e) => Err(format!("Failed to get port info: {}", e)),
        }
    }
}

// You can also have standalone functions if you prefer
pub fn scan_for_devices() -> Result<Vec<String>, String> {
    // This could scan for specific device types, filter by vendor ID, etc.
    match available_ports() {
        Ok(ports) => {
            let device_info: Vec<String> = ports
                .into_iter()
                .filter_map(|port| {
                    let mut port_name = port.port_name;
                    
                    // Remove any trailing slashes
                    if port_name.ends_with('/') {
                        port_name.pop();
                    }
                    
                    // Skip /dev/tty.* devices on macOS (same filtering as get_available_ports)
                    if port_name.starts_with("/dev/tty.") {
                        return None;
                    }
                    
                    // Filter for specific device types if needed
                    match port.port_type {
                        serialport::SerialPortType::UsbPort(usb_info) => {
                            Some(format!("{} - USB Device (VID: {:04x}, PID: {:04x})", 
                                port_name, usb_info.vid, usb_info.pid))
                        }
                        _ => Some(format!("{} - Other", port_name)),
                    }
                })
                .collect();
            Ok(device_info)
        }
        Err(e) => Err(format!("Failed to scan for devices: {}", e)),
    }
}
