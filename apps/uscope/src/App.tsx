import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button, VStack, Box } from "@chakra-ui/react";
import MainMenu from "./components/ui/mainmenu";
import "./App.css";

function App() {
    const [fetchResult, setFetchResult] = useState<any>(null);

    async function testFetch() {
        const url = 'http://192.168.1.104:15081';
        try {
            const result = await invoke('fetch_json_as_kv', { url });
            setFetchResult(result);
        } catch (err) {
            setFetchResult({ error: String(err) });
        }
    }

    return (
        <>
            <MainMenu />
            <VStack w="100%" maxW="md" p={8}>
                <Button colorScheme="blue" onClick={testFetch}>
                    Refresh
                </Button>
                {fetchResult && (
                    <Box w="100%" mt={4} p={4} borderRadius="md" fontSize="sm" whiteSpace="pre-wrap">
                        {typeof fetchResult === "object"
                            ? JSON.stringify(fetchResult, null, 2)
                            : String(fetchResult)}
                    </Box>
                )}
            </VStack>
        </>
    );
}

export default App;
