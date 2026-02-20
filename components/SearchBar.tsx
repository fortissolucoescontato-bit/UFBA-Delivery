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

    return (
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Input
                type="text"
                placeholder="Buscar por lanche, doce, restaurante..."
                className="pl-10 h-12 bg-background/50 border-border/40 backdrop-blur-sm rounded-2xl shadow-sm text-base"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
            />
            {isPending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                </div>
            )}
        </div>
    )
}
