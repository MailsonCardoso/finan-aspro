import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "primary";
}

export function ConfirmModal({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "danger",
}: ConfirmModalProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-[400px] animate-in fade-in zoom-in-95 duration-200">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-foreground">{title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground leading-relaxed pt-2">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0 mt-6">
                    <AlertDialogCancel onClick={() => onOpenChange(false)} className="rounded-lg font-medium">
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                            onOpenChange(false);
                        }}
                        className={`rounded-lg font-bold shadow-lg transition-all active:scale-95 ${variant === "danger"
                                ? "bg-danger text-white hover:bg-danger/90 hover:shadow-danger/20"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                            }`}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
