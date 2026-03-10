'use client'

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { config } from "@/lib/config";

export function CategoryFilter() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const activeCategory = searchParams.get("category");
    const activeSubcategory = searchParams.get("subcategory");

    const toggleCategory = (category: string) => {
        const params = new URLSearchParams(searchParams);
        if (activeCategory === category) {
            params.delete("category");
            params.delete("subcategory");
        } else {
            params.set("category", category);
            params.delete("subcategory");
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const toggleSubcategory = (sub: string) => {
        const params = new URLSearchParams(searchParams);
        if (activeSubcategory === sub) {
            params.delete("subcategory");
        } else {
            params.set("subcategory", sub);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const currentCategory = config.categories.find((c) => c.id === activeCategory);

    return (
        <div className="space-y-3">
            {/* Pills principais */}
            <div className="flex flex-wrap gap-2 md:gap-2.5 px-1 py-1 items-center justify-center md:justify-start">
                <button
                    type="button"
                    onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.delete("category");
                        params.delete("subcategory");
                        router.push(`${pathname}?${params.toString()}`);
                    }}
                    className={`flex-shrink-0 flex items-center gap-2 whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-black tracking-wide transition-all duration-200 active:scale-95 border ${
                        !activeCategory
                            ? "bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20"
                            : "bg-white text-slate-600 border-slate-200 hover:border-brand-primary/40 hover:text-brand-primary hover:bg-brand-primary/5 shadow-sm"
                    }`}
                >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    TODOS
                </button>

                {config.categories.map((cat) => (
                    <button
                        type="button"
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex-shrink-0 flex items-center gap-2 cursor-pointer whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-black tracking-wide transition-all duration-200 active:scale-95 border ${
                            activeCategory === cat.id
                                ? "bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20"
                                : "bg-white text-slate-600 border-slate-200 hover:border-brand-primary/40 hover:text-brand-primary hover:bg-brand-primary/5 shadow-sm"
                        }`}
                    >
                        <span className="text-sm">{cat.icon}</span>
                        {cat.id.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Subcategorias */}
            {currentCategory && currentCategory.subcategories.length > 0 && (
                <div className="flex flex-wrap gap-2 px-5 py-3 items-center justify-center md:justify-start bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                    {currentCategory.subcategories.map((sub) => (
                        <button
                            type="button"
                            key={sub}
                            onClick={() => toggleSubcategory(sub)}
                            className={`flex-shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all duration-200 active:scale-95 border ${
                                activeSubcategory === sub
                                    ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                                    : "bg-white/60 text-slate-500 border-slate-200/60 hover:text-brand-primary hover:border-brand-primary/30 hover:bg-white"
                            }`}
                        >
                            {sub}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
