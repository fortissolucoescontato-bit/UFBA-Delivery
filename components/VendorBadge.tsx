import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"

export function VendorBadge() {
    return (
        <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0">
            <CheckCircle2 className="h-3 w-3" />
            Verificado
        </Badge>
    )
}
