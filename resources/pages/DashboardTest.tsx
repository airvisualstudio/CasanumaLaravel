import { Button } from "@/components/ui/button";

interface Props {
    user: string;
    status: string;
}

export default function DashboardTest({ user, status }: Props) {
    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">Halo, {user}!</h1>
            <p className="text-muted-foreground">Status: {status}</p>
            <Button onClick={() => alert('Radix Button Works!')}>
                Test Shadcn Button
            </Button>
        </div>
    );
}