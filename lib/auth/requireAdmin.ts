import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

type AdminProfile = {
  id: string
  role?: string | null
  full_name?: string | null
}

/**
 * Garante que o usuário atual é admin.
 *
 * - Se não estiver autenticado → redireciona para login.
 * - Se não tiver role = 'admin' → redireciona para home.
 *
 * Retorna o user + profile para uso em layouts/páginas admin.
 */
export async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', user.id)
    .single<AdminProfile>()

  if (error || !profile || profile.role !== 'admin') {
    // Usuário autenticado mas não é admin
    redirect('/')
  }

  return { user, profile }
}

