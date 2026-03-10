'use client'

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Compass } from "lucide-react";

const LOCATIONS = [
    "PAF 1", "PAF 2", "Biblioteca", "Da Ondina", "Praça Politecnica", "Direito/Biologia"
];

export function LocationFilter() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const activeLocation = searchParams.get("location");

    const toggleLocation = (location: string) => {
        const params = new URLSearchParams(searchParams);
        if (activeLocation === location) {
            params.delete("location");
        } else {
            params.set("location", location);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex gap-3 overflow-x-auto px-4 py-3 no-scrollbar bg-background/80 backdrop-blur-xl border-b border-border/40 min-h-[60px] items-center">
            <button
                type="button"
                onClick={() => router.push(pathname)}
                className={`flex-shrink-0 flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-300 ring-1 ring-inset ${!activeLocation
                    ? "bg-primary text-primary-foreground ring-primary shadow-lg shadow-primary/25 scale-105"
                    : "bg-muted/50 text-muted-foreground ring-border/50 hover:bg-muted hover:text-foreground"
                    }`}
            >
                <Compass className="w-4 h-4" />
                Explorar
            </button>
            <div className="w-[1px] h-6 bg-border/50 flex-shrink-0 mx-1"></div>
            {LOCATIONS.map((location) => (
                <button
                    type="button"
                    key={location}
                    onClick={() => toggleLocation(location)}
                    className={`flex-shrink-0 cursor-pointer whitespace-nowrap px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-300 ring-1 ring-inset ${activeLocation === location
                        ? "bg-secondary text-secondary-foreground ring-secondary shadow-lg shadow-secondary/25 scale-105"
                        : "bg-muted/50 text-muted-foreground ring-border/50 hover:bg-muted hover:text-foreground"
                        }`}
                >
                    {location}
                </button>
            ))}
        </div>
    );
}
