//! # Serial Manager Crate
//! 
//! A background serial port discovery and management service for Rust applications.
//! 
//! This crate provides automatic discovery of serial ports with background monitoring
//! for device connection/disconnection events.
//! 
//! ## Quick Start
//! 
//! ```rust ignore
//! use serial_manager::{SerialManager, PortEvent};
//! 
//! let manager = SerialManager::new();
//! let ports = manager.get_ports();
//! println!("Available ports: {:?}", ports);
//! 
//! // Poll for events
//! while let Ok(event) = manager.poll_event() {
//!     match event {
//!         PortEvent::Added(port) => println!("Device connected: {}", port),
//!         PortEvent::Removed(port) => println!("Device disconnected: {}", port),
//!     }
//! }
//! ```

mod manager;
mod discovery;

// Re-export the public API
pub use manager::{SerialManager, SerialEvent};  // Added SerialEvent

// Re-export common types that users might need
pub use std::time::{Duration, SystemTime};