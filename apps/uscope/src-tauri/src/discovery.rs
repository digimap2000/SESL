use futures_util::{pin_mut, stream::StreamExt};
use log::info;
use mdns::RecordKind;
use serde::Serialize;
use std::{
    sync::{Arc, Mutex},
    time::Duration,
};

#[derive(Serialize, Clone)]
pub struct MdnsDevice {
    pub name: String,
    pub ip: String,
    pub port: Option<u16>,
}

type SharedDevices = Arc<Mutex<Vec<MdnsDevice>>>;

pub struct MdnsDiscovery {
    devices: SharedDevices,
}

impl MdnsDiscovery {
    pub fn new() -> Self {
        Self {
            devices: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn launch(
        &mut self,
        service_type: String,
    ) -> impl std::future::Future<Output = ()> + Send + 'static {
        let devices = self.devices.clone();
        async move {
            let service = if service_type.ends_with(".local") {
                service_type
            } else {
                format!("{}.local", service_type)
            };
            let stream = match mdns::discover::all(&service, Duration::from_secs(5)) {
                Ok(s) => s.listen(),
                Err(e) => {
                    eprintln!("mDNS discovery error: {}", e);
                    return;
                }
            };
            pin_mut!(stream);

            while let Some(Ok(response)) = stream.next().await {
                let name = response.hostname().unwrap_or("<unknown>").to_string();
                let port = response.port();
                let ip = response
                    .records()
                    .filter_map(|r| match r.kind {
                        RecordKind::A(addr) => Some(addr.to_string()),
                        RecordKind::AAAA(addr) => Some(addr.to_string()),
                        _ => None,
                    })
                    .next();

                if let Some(ip) = ip {
                    let mut devs = devices.lock().unwrap();
                    // Update or insert device
                    info!("Found device: {} at {}:{}", name, ip, port.unwrap_or(0));
                    if !devs.iter().any(|d| d.name == name && d.ip == ip) {
                        devs.push(MdnsDevice {
                            name: name.clone(),
                            ip,
                            port: port,
                        });
                    }
                }
            }
        }
    }

    pub fn get_devices(&self) -> Vec<MdnsDevice> {
        self.devices.lock().unwrap().clone()
    }
}
