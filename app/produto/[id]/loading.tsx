import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-background">
            <header className="fixed top-0 z-50 w-full px-4 pt-4 flex items-center justify-between pointer-events-none">
                <div className="h-10 w-10 bg-muted/80 backdrop-blur rounded-xl animate-pulse" />
                <div className="h-10 w-10 bg-muted/80 backdrop-blur rounded-full animate-pulse" />
            </header>

            {/* Hero Image Skeleton */}
            <div className="aspect-square w-full bg-muted animate-pulse" />

            <main className="container -mt-6 relative z-10 px-6 py-10 space-y-6 bg-white rounded-t-[3rem] shadow-2xl">
                <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-64 bg-muted rounded-lg animate-pulse" />
                    <div className="h-10 w-32 bg-muted rounded-xl animate-pulse mt-4" />
                </div>

                <div className="flex gap-4 p-4 rounded-3xl bg-muted/20 animate-pulse">
                    <div className="h-12 w-12 rounded-2xl bg-muted" />
                    <div className="flex flex-col gap-2 justify-center">
                        <div className="h-3 w-32 bg-muted rounded" />
                        <div className="h-3 w-20 bg-muted rounded opacity-50" />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="h-5 w-48 bg-muted rounded animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-4 w-[90%] bg-muted rounded animate-pulse opacity-80" />
                        <div className="h-4 w-[75%] bg-muted rounded animate-pulse opacity-80" />
                        <div className="h-4 w-[85%] bg-muted rounded animate-pulse opacity-80" />
                    </div>
                </div>
            </main>

            {/* Bottom Bar Skeleton */}
            <footer className="fixed bottom-0 z-50 w-full p-6 bg-white/80 backdrop-blur border-t animate-pulse">
                <div className="h-14 w-full bg-muted rounded-2xl" />
            </footer>
        </div>
    )
}
