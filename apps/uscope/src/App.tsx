import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/custom/navigation";
import { ProductCard } from "./components/custom/cards";
import "./App.css";

function App() {
    const [deviceList, setDeviceList] = useState<any>(null);

    async function refreshDevices() {
        try {
            const devices = await invoke('fetch_device_list', {});
            let parsedDevices = devices;
            if (typeof devices === "string") {
                parsedDevices = JSON.parse(devices);
            }
            setDeviceList(parsedDevices);
        } catch (err) {
            setDeviceList({ error: String(err) });
        }
    }

    return (
        <main className="flex flex-col min-h-screen items-center justify-center pt-20 pb-8">
            <NavBar />
            <Button onClick={refreshDevices}>Refresh</Button>
            {deviceList && Array.isArray(deviceList) && deviceList.length > 0 && (
                <div>
                    {deviceList.map((device) => (
                        <ProductCard name={device.name} ip={device.ip} />
                    ))}
                </div>
            )}

        </main>
    );
}

export default App;
