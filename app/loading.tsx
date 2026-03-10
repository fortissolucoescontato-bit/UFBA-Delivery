import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header Skeleton */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4">
                    <div className="h-8 w-32 bg-muted rounded-lg animate-pulse" />
                    <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                </div>
            </header>

            <main className="container px-4 py-6 space-y-8">
                {/* Search/Filter Skeleton */}
                <div className="space-y-4">
                    <div className="h-12 w-full bg-muted rounded-2xl animate-pulse" />
                    <div className="flex gap-2 overflow-hidden pointer-events-none">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-9 w-24 bg-muted rounded-xl shrink-0 animate-pulse" />
                        ))}
                    </div>
                </div>

                {/* Banner Skeleton */}
                <div className="h-48 w-full bg-muted rounded-[2rem] animate-pulse" />

                {/* Grid Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="aspect-[4/5] bg-muted rounded-[1.5rem] animate-pulse" />
                    ))}
                </div>
            </main>
        </div>
    )
}
