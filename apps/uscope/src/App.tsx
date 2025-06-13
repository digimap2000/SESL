import { useState } from "react";
import { Routes, Route } from 'react-router-dom';
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/custom/navigation";
import { ProductCard } from "@/components/custom/cards";
import { PixiGraph } from "@/components/custom/pixigraph";
import "./App.css";

function App() {
    return (
        <main className="flex flex-col min-h-screen items-center justify-center pt-20 pb-8">
            <NavBar />
            <Routes>
                <Route path="/watch" element={<Watch />} />
                <Route path="/graphic" element={<Graphic />} />
                <Route path="*" element={<Home />} />
            </Routes>
        </main>
    );
}

function Home() {
    return <div>Home Page</div>;
}

function Watch() {
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
        <div>
            <Button onClick={refreshDevices}>Refresh</Button>
            {
                deviceList && Array.isArray(deviceList) && deviceList.length > 0 && (
                    <div>
                        {deviceList.map((device) => (
                            <ProductCard name={device.name} ip={device.ip} />
                        ))}
                    </div>
                )
            }
        </div>);
}

function Graphic() {
    return (
        <div className="p-4">
            <PixiGraph />
        </div>
    );
}

export default App;
