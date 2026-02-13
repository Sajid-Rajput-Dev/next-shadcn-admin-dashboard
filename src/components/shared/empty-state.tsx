import { FileX, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ 
  title = "No data found", 
  description = "Try adjusting your filters or search query.", 
  icon 
}: EmptyStateProps) {
  return (
    <div className="flex h-[300px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
        {icon || <FileX className="h-6 w-6" />}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[250px]">
        {description}
      </p>
    </div>
  );
}

export function ErrorState({ error, reset }: { error?: Error; reset?: () => void }) {
    return (
        <div className="flex h-[300px] w-full flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive">
                <AlertCircle className="h-6 w-6" />
             </div>
             <div>
                <h3 className="text-lg font-semibold text-destructive">Something went wrong</h3>
                <p className="text-sm text-muted-foreground max-w-[300px]">
                    {error?.message || "An unexpected error occurred while loading data."}
                </p>
             </div>
             {reset && (
                 <button 
                    onClick={reset}
                    className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
                 >
                    Try Again
                 </button>
             )}
        </div>
    );
}
