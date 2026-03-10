import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#F6F9FC] p-4 pb-24 font-sans animate-pulse">
            <header className="flex items-center gap-4 mb-8 pt-2">
                <div className="h-10 w-10 bg-slate-200 rounded-xl" />
                <div>
                    <div className="h-8 w-48 bg-slate-200 rounded-lg mb-2" />
                    <div className="h-3 w-32 bg-slate-200 rounded-md opacity-50" />
                </div>
                <div className="ml-auto h-10 w-10 bg-slate-200 rounded-full" />
            </header>

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="rounded-[2rem] border-none shadow-sm h-32 bg-white/50">
                            <CardContent className="p-6 flex flex-col justify-between h-full">
                                <div className="h-4 w-12 bg-slate-100 rounded" />
                                <div className="h-8 w-20 bg-slate-100 rounded-lg" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="h-40 bg-white/50 rounded-[2.5rem] border-none" />
                        <div className="h-56 bg-white/50 rounded-[2.5rem] border-none" />

                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <div className="h-6 w-40 bg-slate-200 rounded" />
                                <div className="h-10 w-24 bg-slate-200 rounded-xl" />
                            </div>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 bg-white/70 border-2 border-slate-100 rounded-[1.5rem]" />
                            ))}
                        </div>
                    </div>
                    <div className="h-80 bg-white/50 rounded-[2.5rem] border-none" />
                </div>
            </div>
        </div>
    )
}
