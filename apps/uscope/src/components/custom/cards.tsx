import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card"

interface ProductCardProps {
    name: string;
    ip: string;
}

export function ProductCard({ name, ip }: ProductCardProps): JSX.Element {
    return (
        <Card className="max-w-full break-words whitespace-normal">
            <CardContent className="text-center space-y-2">
                <CardTitle>{ip}</CardTitle>
                <CardDescription className="max-w-full">{name}</CardDescription>
            </CardContent>
        </Card>
    );
}
