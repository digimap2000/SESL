import { Routes, Route } from 'react-router-dom';
import { NavBar } from "@/components/custom/navigation";
import SerialDashboard from "@/components/custom/SerialDashboard";
import LogViewer from "@/components/custom/LogViewer";
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
                    <Route path="*" element={<Home />} />
                </Routes>
            </main>
        </div>
    );
}

function Home() {
    return (
        <div className="w-full h-full">
            <LogViewer />   
        </div>        
    );
}

function Watch() {
    return (
        <div className="w-full h-full">
            <SerialDashboard />
        </div>);
}

export default App;
