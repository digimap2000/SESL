use reqwest;
use serde_json::Value;
use std::collections::HashMap;
use std::sync::Mutex;
mod discovery;
use discovery::MdnsDiscovery;
use once_cell::sync::Lazy;

// Global, thread-safe MdnsDiscovery instance
static GLOBAL_DISCOVERY: Lazy<Mutex<MdnsDiscovery>> = Lazy::new(|| {
    Mutex::new(MdnsDiscovery::new())
});

#[tauri::command]
async fn say_hello(name: String) -> String {
    format!("Hello, {}!", name)
}

#[tauri::command]
async fn fetch_device_list() -> String {
    let disc = GLOBAL_DISCOVERY.lock().unwrap();
    let devices = disc.get_devices(); // Ensure get_devices is thread-safe!
    serde_json::to_string(&devices).unwrap_or_else(|_| "[]".to_string())
}

#[tauri::command]
async fn fetch_json_as_kv(url: &str) -> Result<HashMap<String, String>, String> {
    let response = reqwest::get(url)
        .await
        .map_err(|e| format!("Request error: {}", e))?;

    let json: Value = response
        .json()
        .await
        .map_err(|e| format!("JSON parse error: {}", e))?;

    // Convert JSON to key-value pairs (flatten one level deep)
    let mut result = HashMap::new();

    match json {
        Value::Object(map) => {
            for (k, v) in map {
                result.insert(k, v.to_string());
            }
        }
        Value::Array(arr) => {
            for (i, item) in arr.into_iter().enumerate() {
                if let Value::Object(obj) = item {
                    for (k, v) in obj {
                        result.insert(format!("{}[{}]", k, i), v.to_string());
                    }
                }
            }
        }
        _ => return Err("Unexpected JSON structure".to_string()),
    }

    Ok(result)
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
            fetch_json_as_kv,
            say_hello,
            fetch_device_list
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
