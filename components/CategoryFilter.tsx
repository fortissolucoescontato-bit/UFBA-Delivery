'use client'

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Utensils } from "lucide-react";

const CATEGORIES = [
    { id: "Lanches", icon: "🍔" },
    { id: "Doces", icon: "🍰" },
    { id: "Bebidas", icon: "🥤" },
    { id: "Almoço", icon: "🍱" },
    { id: "Saudável", icon: "🥗" },
    { id: "Outros", icon: "🍟" },
];

export function CategoryFilter() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const activeCategory = searchParams.get("category");

    const toggleCategory = (category: string) => {
        const params = new URLSearchParams(searchParams);
        if (activeCategory === category) {
            params.delete("category");
        } else {
            params.set("category", category);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex gap-3 overflow-x-auto px-4 py-3 no-scrollbar items-center">
            <button
                type="button"
                onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("category");
                    router.push(`${pathname}?${params.toString()}`);
                }}
                className={`flex-shrink-0 flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-300 ring-1 ring-inset ${!activeCategory
                    ? "bg-primary text-primary-foreground ring-primary shadow-lg shadow-primary/25 scale-105"
                    : "bg-muted/50 text-muted-foreground ring-border/50 hover:bg-muted hover:text-foreground"
                    }`}
            >
                <Utensils className="w-4 h-4" />
                Todos
            </button>
            <div className="w-[1px] h-6 bg-border/50 flex-shrink-0 mx-1"></div>
            {CATEGORIES.map((cat) => (
                <button
                    type="button"
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 cursor-pointer whitespace-nowrap px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-300 ring-1 ring-inset ${activeCategory === cat.id
                        ? "bg-secondary text-secondary-foreground ring-secondary shadow-lg shadow-secondary/25 scale-105"
                        : "bg-muted/50 text-muted-foreground ring-border/50 hover:bg-muted hover:text-foreground"
                        }`}
                >
                    <span>{cat.icon}</span>
                    {cat.id}
                </button>
            ))}
        </div>
    );
}
