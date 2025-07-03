import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { ThemeToggle } from "@/components/custom/theming"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { Link } from 'react-router-dom';
import { JSX } from "react";

export function VersionPill(): JSX.Element {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="inline-flex items-center cursor-pointer">
                    <Badge className="rounded-full px-2 py-0 text-xs flex items-center">
                        Cereal v2.5.1<ChevronDown className="p-0" />
                    </Badge>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuItem>Release Date: June 12, 2025</DropdownMenuItem>
                <DropdownMenuItem>Changelog</DropdownMenuItem>
                <DropdownMenuItem>View on GitHub</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


export function NavBar(): JSX.Element {
    return (
        <nav className="w-full h-full px-4 py-4 border-b border-gray-500">
            <div className="flex items-center space-x-4">
                {/* Brand */}                
                <Link to="/"><img src="/upip.png" alt="uScope Logo" className="h-6 w-6 rounded-full" /></Link>

                {/* Navigation menu */}
                <div className="flex-1">
                    <NavigationMenu className="text-m">
                        <NavigationMenuList className="flex space-x-4">
                            <NavigationMenuItem asChild>
                                <Link to="/watch">Discovery</Link>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Nerd Corner */}
                <VersionPill />
                <ThemeToggle />
            </div>
        </nav>
    );
}
