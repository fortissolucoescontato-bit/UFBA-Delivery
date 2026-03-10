'use client'

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useTransition, useState, useEffect } from "react"

export function SearchBar() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()
    const defaultQuery = searchParams.get('q') ?? ''
    const [query, setQuery] = useState(defaultQuery)

    // Sync input when URL changes
    useEffect(() => {
        setQuery(searchParams.get('q') ?? '')
    }, [searchParams])

    const handleSearch = (term: string) => {
        setQuery(term)
        startTransition(() => {
            const params = new URLSearchParams(searchParams)
            if (term) {
                params.set('q', term)
            } else {
                params.delete('q')
            }
            router.push(`${pathname}?${params.toString()}`)
        })
    }

    const [isFocused, setIsFocused] = useState(false)

    // Sugestões Spotlight V10
    const suggestions = [
        { label: 'Notebook Dell/Mac', icon: '💻' },
        { label: 'Livro de Cálculo', icon: '📚' },
        { label: 'Resumo de TCC', icon: '📝' },
        { label: 'Monitor 24"', icon: '🖥️' },
        { label: 'Serviço de Formatação', icon: '🛠️' },
    ]

    const categories = [
        { label: 'Tecnologia', id: 'tecnologia' },
        { label: 'Livros & Papelaria', id: 'livros' },
        { label: 'Serviços/Freelance', id: 'servicos' },
    ]

    return (
        <div className="relative w-full z-50 group">
            <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 z-10 ${isFocused ? 'text-black' : 'text-slate-400'}`} />
                <Input
                    type="text"
                    placeholder="Busque por produtos, lojas ou categorias..."
                    className={`pl-12 h-14 bg-[#FAFAFA] border-slate-200 backdrop-blur-md rounded-2xl transition-all duration-300 placeholder:text-slate-400 font-bold text-base focus-visible:ring-0 focus-visible:border-black ${isFocused ? 'shadow-md border-black bg-white ring-1 ring-black' : 'shadow-none hover:border-slate-300 hover:bg-white'
                        }`}
                    value={query}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    onChange={(e) => handleSearch(e.target.value)}
                />

                {isPending && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="h-5 w-5 border-2 border-black border-t-transparent animate-spin rounded-full" />
                    </div>
                )}
            </div>

            {/* Spotlight Suggestions Overlay */}
            {isFocused && (
                <div className="absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in-up p-4 space-y-4 z-50">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Sugestões de Descoberta</p>
                        <div className="flex flex-wrap gap-2 px-1">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSearch(s.label)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-all border border-slate-100 hover:border-slate-300 text-xs font-bold text-black"
                                >
                                    <span className="text-sm opacity-60 grayscale">{s.icon}</span>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Categorias em Alta</p>
                        <div className="grid grid-cols-1 gap-1">
                            {categories.map((c, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        const params = new URLSearchParams(searchParams)
                                        params.set('category', c.id)
                                        router.push(`${pathname}?${params.toString()}`)
                                    }}
                                    className="flex items-center justify-between w-full h-12 px-3 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-xl transition-all group"
                                >
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-black">{c.label}</span>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
