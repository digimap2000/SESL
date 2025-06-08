use std::collections::HashMap;
use serde_json::Value;
use reqwest;
use tokio;

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
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![fetch_json_as_kv])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
