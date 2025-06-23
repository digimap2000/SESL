import { useState } from "react";
import { Routes, Route } from 'react-router-dom';
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/custom/navigation";
import { ProductCard } from "@/components/custom/cards";
import { Chart } from "@/components/custom/pixiapp";
import "./App.css";

function App() {
    return (
        <div className="h-screen flex flex-col">
            <header className="h-16">
                <NavBar />
            </header>
            <main className="flex-1 flex flex-col items-center justify-center">
                <Routes>
                    <Route path="/watch" element={<Watch />} />
                    <Route path="/graphic" element={<Graphic />} />
                    <Route path="*" element={<Home />} />
                </Routes>
            </main>
        </div>
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
        <div className="flex-1 w-full flex flex-col p-4 gap-4">
            <Chart className="flex-2 w-full bg-gray-500/5 rounded-lg" />
            <Chart className="flex-1 w-full bg-gray-500/5 rounded-lg" />
        </div>
    );
}

export default App;
