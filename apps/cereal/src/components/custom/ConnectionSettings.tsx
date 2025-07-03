import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Settings2, Zap, TestTube, Cable } from "lucide-react";

interface ConnectionSettingsProps {
  readonly selectedPort?: string;
  readonly onConnect?: () => void;
  readonly onTest?: () => void;
}

export default function ConnectionSettings({ 
  selectedPort, 
  onConnect, 
  onTest 
}: ConnectionSettingsProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-xl">Connection Settings</CardTitle>
        </div>
        <CardDescription>
          Configure serial port connection parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Port Status Section */}
        {selectedPort && (
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-3">
              <Cable className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">{selectedPort}</p>
                <p className="text-xs text-muted-foreground">Ready to connect</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Available
            </Badge>
          </div>
        )}
        
        {/* Basic Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-base font-semibold text-foreground">Basic Settings</h3>
            <Separator className="flex-1" />
          </div>
          
          <div className="space-y-6 pl-4">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-shrink-0 w-20">
                <Label htmlFor="baud-rate" className="text-sm font-normal text-muted-foreground">Baud Rate</Label>
              </div>
              <div className="flex-1 max-w-xs">
                <Select defaultValue="9600">
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select baud rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9600">9,600 bps</SelectItem>
                    <SelectItem value="19200">19,200 bps</SelectItem>
                    <SelectItem value="38400">38,400 bps</SelectItem>
                    <SelectItem value="57600">57,600 bps</SelectItem>
                    <SelectItem value="115200">115,200 bps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-6">
              <div className="flex-shrink-0 w-20">
                <Label htmlFor="data-bits" className="text-sm font-normal text-muted-foreground">Data Bits</Label>
              </div>
              <div className="flex-1 max-w-xs">
                <Select defaultValue="8">
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select data bits" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8 bits</SelectItem>
                    <SelectItem value="7">7 bits</SelectItem>
                    <SelectItem value="6">6 bits</SelectItem>
                    <SelectItem value="5">5 bits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-base font-semibold text-foreground">Advanced Settings</h3>
            <Separator className="flex-1" />
          </div>
          
          <div className="space-y-6 pl-4">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-shrink-0 w-20">
                <Label htmlFor="parity" className="text-sm font-normal text-muted-foreground">Parity</Label>
              </div>
              <div className="flex-1 max-w-xs">
                <Select defaultValue="none">
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select parity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="even">Even</SelectItem>
                    <SelectItem value="odd">Odd</SelectItem>
                    <SelectItem value="mark">Mark</SelectItem>
                    <SelectItem value="space">Space</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-6">
              <div className="flex-shrink-0 w-20">
                <Label htmlFor="stop-bits" className="text-sm font-normal text-muted-foreground">Stop Bits</Label>
              </div>
              <div className="flex-1 max-w-xs">
                <Select defaultValue="1">
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select stop bits" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 bit</SelectItem>
                    <SelectItem value="1.5">1.5 bits</SelectItem>
                    <SelectItem value="2">2 bits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-6">
              <div className="flex-shrink-0 w-20">
                <Label htmlFor="flow-control" className="text-sm font-normal text-muted-foreground">Flow Control</Label>
              </div>
              <div className="flex-1 max-w-xs">
                <Select defaultValue="none">
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select flow control" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="hardware">Hardware (RTS/CTS)</SelectItem>
                    <SelectItem value="software">Software (XON/XOFF)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Connection Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            disabled={!selectedPort}
            onClick={onConnect}
            className="flex-1 h-11 font-medium"
            size="lg"
          >
            <Zap className="mr-2 h-4 w-4" />
            Connect to Port
          </Button>
          <Button 
            variant="outline"
            disabled={!selectedPort}
            onClick={onTest}
            className="flex-1 h-11"
            size="lg"
          >
            <TestTube className="mr-2 h-4 w-4" />
            Test Connection
          </Button>
        </div>
        
        {!selectedPort && (
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
              <Cable className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Select a serial port from the sidebar to configure connection settings
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
