import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface SerialTerminalProps {
  readonly selectedPort?: string;
}

export default function SerialTerminal({ selectedPort }: SerialTerminalProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Serial Terminal</CardTitle>
        <CardDescription>
          {selectedPort 
            ? `Interactive terminal for ${selectedPort}` 
            : "Select a serial port to open terminal"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)]">
        <div className="h-full bg-black text-green-400 font-mono p-4 rounded-md">
          {selectedPort ? (
            <div>
              <div>Connected to {selectedPort}</div>
              <div>Baud rate: 9600</div>
              <div className="mt-4 text-gray-400">
                # Terminal functionality coming soon...
              </div>
              <div className="mt-2">
                <span className="text-green-400">$ </span>
                <span className="animate-pulse">_</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center mt-20">
              Select a serial port to start terminal session
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
