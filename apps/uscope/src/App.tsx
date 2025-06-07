import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button, Input, Heading, Text, VStack, HStack, Box } from "@chakra-ui/react";
import "./App.css";

function App() {
    const [greetMsg, setGreetMsg] = useState("");
    const [name, setName] = useState("");

    async function greet() {
        setGreetMsg(await invoke("greet", { name }));
    }

    return (
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
            <VStack w="100%" maxW="md" p={8} borderRadius="lg" boxShadow="lg">
                <Heading>Welcome to Tauri + React + Chakra</Heading>
                <HStack w="100%">
                    <Input
                        id="greet-input"
                        value={name}
                        onChange={(e) => setName(e.currentTarget.value)}
                        placeholder="Enter a name..."
                    />
                    <Button colorScheme="blue" onClick={greet}>
                        Greet
                    </Button>
                </HStack>
                <Text>{greetMsg}</Text>
            </VStack>
        </Box>
    );
}

export default App;
