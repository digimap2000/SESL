import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "../ui/button";

interface SerialPortListProps {
  readonly onPortSelect?: (port: string) => void;
  readonly selectedPort?: string;
}

export default function SerialPortList({ onPortSelect, selectedPort }: SerialPortListProps) {
  const [ports, setPorts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch serial ports
  const fetchPorts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<string[]>("get_serial_ports");
      setPorts(result);
    } catch (err) {
      setError(err as string);
      console.error("Failed to fetch serial ports:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load ports on component mount
  useEffect(() => {
    fetchPorts();
  }, []);

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

  return (
    <div className="w-full">
      {error && (
        <div className="text-red-500 text-xs mb-2 p-2 bg-red-50 rounded-md">
          Error: {error}
        </div>
      )}
      
      <div className="flex items-center justify-end mb-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchPorts}
          disabled={loading}
          className="h-6 px-2 text-xs"
        >
          {loading ? "..." : "↻"}
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-4 text-gray-500">
          <div className="animate-spin inline-block w-4 h-4 border border-gray-300 border-t-blue-500 rounded-full mb-1"></div>
          <p className="text-xs">Scanning...</p>
        </div>
      ) : (
        <>
          {ports.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p className="text-xs">No ports found</p>
              <Button variant="outline" size="sm" onClick={fetchPorts} className="mt-1 h-6 px-2 text-xs">
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {ports.map((port) => (
                <Button
                  key={port}
                  variant={selectedPort === port ? "default" : "outline"}
                  size="sm"
                  className={`w-full justify-start h-auto min-h-[2.5rem] p-3 text-left whitespace-normal ${
                    selectedPort === port 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background hover:bg-accent"
                  }`}
                  onClick={() => onPortSelect?.(port)}
                >
                  <div className="flex items-start space-x-2 w-full">
                    <span className="text-sm flex-shrink-0 mt-0.5">{getPortIcon(port)}</span>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="font-medium text-xs break-all leading-relaxed">
                        {port}
                      </div>
                      <div className="text-muted-foreground text-xs mt-0.5">{getPortType(port)}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </>
      )}
      
      {ports.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          {ports.length} port{ports.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
