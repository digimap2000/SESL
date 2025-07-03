import { useState } from "react";
import SerialPortList from "./SerialPortList";
import LogViewer from "./LogViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Settings, Zap, Terminal } from "lucide-react";

export default function SerialDashboard() {
  const [selectedPort, setSelectedPort] = useState<string | undefined>();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <Sidebar collapsible="none" className="border-r">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <Zap className="h-6 w-6" />
              <span className="text-lg font-semibold">Serial Monitor</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Serial Ports</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-2">
                  <SerialPortList 
                    selectedPort={selectedPort}
                    onPortSelect={setSelectedPort}
                  />
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            {selectedPort && (
              <SidebarGroup>
                <SidebarGroupLabel>Connection</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-2">
                    <Card>
                      <CardContent className="p-3">
                        <div className="text-sm font-mono">{selectedPort}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Ready to connect
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            <SidebarGroup>
              <SidebarGroupLabel>Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Terminal className="h-4 w-4" />
                      <span>Terminal</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter>
            <div className="p-2 text-xs text-muted-foreground text-center">
              Serial Monitor v1.0
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b px-4 py-2 flex items-center gap-2">
            <h1 className="text-lg font-semibold">
              {selectedPort ? `Monitoring ${selectedPort}` : 'Serial Monitor'}
            </h1>
          </header>
          
          <div className="flex-1 p-4">
            <Tabs defaultValue="logs" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="logs">Log Viewer</TabsTrigger>
                <TabsTrigger value="terminal">Serial Terminal</TabsTrigger>
              </TabsList>
              
              <TabsContent value="logs" className="flex-1 mt-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Serial Port Logs</CardTitle>
                    <CardDescription>
                      {selectedPort 
                        ? `Viewing logs from ${selectedPort}` 
                        : "Select a serial port to view logs"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 h-[calc(100%-80px)]">
                    <LogViewer />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="terminal" className="flex-1 mt-4">
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
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
