
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle(): JSX.Element {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () =>
        setTheme(theme === 'dark' ? 'light' : 'dark');

    return (
        <button onClick={toggleTheme}>
            {(theme === 'light') ? <Sun /> : <Moon />}
        </button>
    );
}
