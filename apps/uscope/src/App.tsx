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
        <main className="flex flex-col min-h-screen items-center justify-center pt-16">
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
        <Chart className="flex-1 w-full p-4"/>
    );
}

export default App;
