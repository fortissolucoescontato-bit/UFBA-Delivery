'use client'

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"

export function DeleteProductButton() {
    const { pending } = useFormStatus()

    return (
        <Button
            size="icon"
            variant="ghost"
            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            type="submit"
            disabled={pending}
        >
            {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </Button>
    )
}
