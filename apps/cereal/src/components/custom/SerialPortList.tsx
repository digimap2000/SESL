import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Button } from "../ui/button";

interface SerialPortListProps {
    readonly onPortSelect?: (port: string) => void;
    readonly selectedPort?: string;
}

// Type definition for the serial events from Rust
interface TauriSerialEvent {
    type: "DeviceArrived" | "DeviceDeparted";
    data: {
        port_name: string;
        timestamp: number;
    };
}

export default function SerialPortList({ onPortSelect, selectedPort }: SerialPortListProps) {
    const [ports, setPorts] = useState<string[]>([]);
    const [recentEvents, setRecentEvents] = useState<TauriSerialEvent[]>([]);

    // Fetch serial ports
    const fetchPorts = async () => {
        try {
            const result = await invoke<string[]>("get_serial_ports");
            setPorts(result);
        } catch (err) {
            console.error("Failed to fetch serial ports:", err);
        }
    };

    // Load ports on component mount and setup event listener
    useEffect(() => {
        fetchPorts();

        // Setup real-time event listener
        const setupEventListener = async () => {
            try {
                const unlisten = await listen<TauriSerialEvent>('serial-device-event', (event) => {
                    const serialEvent = event.payload;
                    console.log('Serial device event:', serialEvent);

                    // Add to recent events log (keep last 10)
                    setRecentEvents(prev => [...prev.slice(-9), serialEvent]);

                    // Update port list in real-time
                    if (serialEvent.type === 'DeviceArrived') {
                        setPorts(prev => {
                            // Only add if not already present
                            if (!prev.includes(serialEvent.data.port_name)) {
                                return [...prev, serialEvent.data.port_name].sort();
                            }
                            return prev;
                        });

                        // Show a brief visual indication
                        console.log(`🔌 Device connected: ${serialEvent.data.port_name}`);

                    } else if (serialEvent.type === 'DeviceDeparted') {
                        setPorts(prev => prev.filter(port => port !== serialEvent.data.port_name));

                        // Clear selection if the selected port was disconnected
                        if (selectedPort === serialEvent.data.port_name) {
                            onPortSelect?.('');
                        }

                        console.log(`🔌 Device disconnected: ${serialEvent.data.port_name}`);
                    }
                });

                // Return cleanup function
                return unlisten;
            } catch (err) {
                console.error('Failed to setup event listener:', err);
                return () => { }; // Return empty cleanup function
            }
        };

        let unlistenFn: (() => void) | undefined;
        setupEventListener().then(fn => unlistenFn = fn);

        // Cleanup on unmount
        return () => {
            if (unlistenFn) unlistenFn();
        };
    }, [selectedPort, onPortSelect]);

    // Get port type/platform indicator
    const getPortType = (port: string) => {
        if (port.startsWith("COM")) return "Windows";
        if (port.startsWith("/dev/tty")) return "Linux/Unix";
        if (port.startsWith("/dev/cu.")) return "macOS";
        return "Unknown";
    };

    // Get port icon based on type
    const getPortIcon = (port: string) => {
        if (port.includes("usb") || port.includes("USB")) return "🔌";
        if (port.includes("bluetooth") || port.includes("Bluetooth")) return "📶";
        if (port.startsWith("COM")) return "💻";
        return "⚡";
    };

    // Check if a port was recently connected (within last 3 seconds)
    const isRecentlyConnected = (port: string) => {
        const now = Date.now();
        return recentEvents.some(event =>
            event.type === 'DeviceArrived' &&
            event.data.port_name === port &&
            now - event.data.timestamp < 3000
        );
    };

    return (
        <div className="w-full">
            {ports.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                    <p className="text-xs">No ports found</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {ports.map((port) => (
                        <Button
                            key={port}
                            variant={selectedPort === port ? "default" : "outline"}
                            size="sm"
                            className={`w-full justify-start h-auto min-h-[2.5rem] p-3 text-left whitespace-normal ${selectedPort === port
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background hover:bg-accent"
                                } ${isRecentlyConnected(port)
                                    ? "ring-2 ring-green-400 bg-green-50 animate-pulse"
                                    : ""
                                }`}
                            onClick={() => onPortSelect?.(port)}
                        >
                            <div className="flex items-start space-x-2 w-full">
                                <span className="text-sm flex-shrink-0 mt-0.5">
                                    {getPortIcon(port)}
                                    {isRecentlyConnected(port) && (
                                        <span className="ml-1 text-green-500">●</span>
                                    )}
                                </span>
                                <div className="min-w-0 flex-1 text-left">
                                    <div className="font-medium text-xs break-all leading-relaxed">
                                        {port}
                                    </div>
                                    <div className="text-muted-foreground text-xs mt-0.5">
                                        {getPortType(port)}
                                        {isRecentlyConnected(port) && (
                                            <span className="text-green-600 ml-1">(just connected)</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Button>
                    ))}
                </div>
            )}

        </div>
    );
}
