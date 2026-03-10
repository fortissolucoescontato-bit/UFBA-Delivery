'use client'

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"

export function DeleteProductButton({ showLabel = false }: { showLabel?: boolean }) {
    const { pending } = useFormStatus()

    return (
        <Button
            size={showLabel ? "sm" : "icon"}
            variant="outline"
            className={`h-9 rounded-lg bg-red-50 border-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center gap-1.5 ${showLabel ? "px-2.5" : ""}`}
            type="submit"
            disabled={pending}
        >
            {pending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
                <Trash2 className="h-3 w-3" />
            )}
            {showLabel && !pending && (
                <span className="text-[8px] font-black uppercase tracking-wider">Excluir</span>
            )}
        </Button>
    )
}
