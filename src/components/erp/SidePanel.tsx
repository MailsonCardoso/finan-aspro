import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface SidePanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: React.ReactNode;
}

export function SidePanel({ open, onOpenChange, title, children }: SidePanelProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-[450px] overflow-y-auto p-0 border-l animate-in slide-in-from-right duration-300">
                <div className="h-full flex flex-col bg-card">
                    <SheetHeader className="p-6 border-b shrink-0 bg-muted/20">
                        <SheetTitle className="text-xl font-bold text-foreground tracking-tight">{title}</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 p-6 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
