'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function approveSeller(sellerId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Não autorizado" }

    // Check if current user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: "Apenas administradores podem aprovar vendedores" }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', sellerId)

    if (error) {
        console.error('Error approving seller:', error)
        return { error: "Erro ao aprovar vendedor" }
    }

    revalidatePath('/admin/vendedores')
    return { success: true }
}

export async function blockSeller(sellerId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Não autorizado" }

    // Check if current user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: "Apenas administradores podem bloquear vendedores" }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ is_approved: false })
        .eq('id', sellerId)

    if (error) {
        console.error('Error blocking seller:', error)
        return { error: "Erro ao bloquear vendedor" }
    }

    revalidatePath('/admin/vendedores')
    return { success: true }
}
