// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Initialize any global application services
    env_logger::init();

    // Running our tauri application library interface
    cereal_lib::run()
}
