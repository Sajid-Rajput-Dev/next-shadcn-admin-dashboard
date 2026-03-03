import { AlertCircle, FileX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "No data found",
  description = "Try adjusting your filters or search query.",
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex h-[300px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
        {icon || <FileX className="h-6 w-6" />}
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="max-w-[250px] text-muted-foreground text-sm">{description}</p>
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
        <h3 className="font-semibold text-destructive text-lg">Something went wrong</h3>
        <p className="max-w-[300px] text-muted-foreground text-sm">
          {error?.message || "An unexpected error occurred while loading data."}
        </p>
      </div>
      {reset && (
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-destructive px-4 py-2 font-medium text-destructive-foreground text-sm hover:bg-destructive/90"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
