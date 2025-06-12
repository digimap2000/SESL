import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { ThemeToggle } from "@/components/custom/theming"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

export function VersionPill(): JSX.Element {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="inline-flex items-center cursor-pointer">
                    <Badge className="rounded-full px-2 py-0 text-xs flex items-center">
                        v2.5.1<ChevronDown className="p-0" />
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
        <nav className="fixed top-0 left-0 right-0 px-4 py-2 backdrop-blur-xl backdrop-opacity-100 border-b border-gray-500 z-50">
            <div className="flex items-center space-x-4">
                {/* Brand */}
                <a href="/" className="text-xl font-bold">
                    uScope
                </a>

                {/* Navigation menu */}
                <div className="flex-1">
                    <NavigationMenu>
                        <NavigationMenuList className="flex space-x-4">
                            <NavigationMenuItem>
                                <NavigationMenuLink href="watch">Discovery</NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink href="something">Something</NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink href="about">About</NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Nerdy Cornere */}
                <VersionPill />
                <ThemeToggle />
            </div>
        </nav>
    );
}
