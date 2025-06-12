
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle(): JSX.Element {
    const { theme, setTheme } = useTheme();

    function toggleTheme() {
        setTheme(theme === 'light' ? 'dark' : 'light');
    }

    return (
        <button onClick={toggleTheme}>
            {(theme === 'light') ? <Sun/> : <Moon/>}
        </button>
    );
}
