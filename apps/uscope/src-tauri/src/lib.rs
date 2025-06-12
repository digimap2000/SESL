use std::sync::Mutex;
mod discovery;
use discovery::MdnsDiscovery;
use once_cell::sync::Lazy;

// Global, thread-safe MdnsDiscovery instance
static GLOBAL_DISCOVERY: Lazy<Mutex<MdnsDiscovery>> = Lazy::new(|| {
    Mutex::new(MdnsDiscovery::new())
});

#[tauri::command]
async fn fetch_device_list() -> String {
    let disc = GLOBAL_DISCOVERY.lock().unwrap();
    let devices = disc.get_devices(); // Ensure get_devices is thread-safe!
    serde_json::to_string(&devices).unwrap_or_else(|_| "[]".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // A discovery deamon will run in the background looking for
    // devices compatible with this application.
    {
        let mut disc = GLOBAL_DISCOVERY.lock().unwrap();
        let fut = disc.launch("_http._tcp".to_string());
        tauri::async_runtime::spawn(fut);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            fetch_device_list
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
