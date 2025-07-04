use std::{collections::HashSet, sync::Arc, sync::Mutex};

mod discovery;
use discovery::DiscoveryService;

pub struct CerialManager {
    known_ports: Arc<Mutex<HashSet<String>>>,
    discovery: DiscoveryService,
}

impl CerialManager {
    pub fn new() -> Self {
        let known_ports = Arc::new(Mutex::new(HashSet::new()));
        let discovery = DiscoveryService::spawn(known_ports.clone());

        CerialManager {
            known_ports,
            discovery,
        }
    }

    pub fn get_ports(&self) -> Result<Vec<String>, String> {
        let known = self.known_ports.lock()
            .map_err(|e| format!("Failed to acquire lock: {}", e))?;
        Ok(known.iter().cloned().collect())
    }
}

impl Drop for CerialManager {
    fn drop(&mut self) { 
        self.discovery.shutdown();
    }
}
