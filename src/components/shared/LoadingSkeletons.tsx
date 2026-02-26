import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number, columns?: number }) {
    return (
        <div className="w-full space-y-4">
            {/* Header */}
            <div className="flex items-center gap-4 py-2 border-b border-border/50">
                {Array.from({ length: columns }).map((_, j) => (
                    <Skeleton key={`h-${j}`} className="h-5 w-full max-w-[100px] bg-primary/10" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={`r-${i}`} className="flex items-center gap-4 py-3">
                    {Array.from({ length: columns }).map((_, j) => (
                        <Skeleton
                            key={`c-${i}-${j}`}
                            className={cn("h-4 w-full bg-secondary/30", j === 0 ? "max-w-[80px]" : "max-w-[120px]")}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/50 p-6 space-y-4 bg-secondary/10">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-full bg-primary/10" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-[120px] bg-secondary/40" />
                            <Skeleton className="h-4 w-[80px] bg-secondary/20" />
                        </div>
                    </div>
                    <Skeleton className="h-20 w-full bg-secondary/20" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-full bg-secondary/30 rounded-lg" />
                        <Skeleton className="h-10 w-full bg-secondary/30 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}
