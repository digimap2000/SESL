import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from 'next-themes'
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
            <App />
        </ThemeProvider>
    </React.StrictMode>,
);
