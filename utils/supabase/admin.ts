import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Client de serviço para operações administrativas.
 *
 * IMPORTANTE:
 * - Usa SUPABASE_SERVICE_ROLE_KEY (NUNCA expor no cliente).
 * - Só deve ser importado/uso em código que roda no servidor
 *   (Server Components, Route Handlers, Server Actions).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Supabase admin client não configurado: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.',
    )
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      // Admin client não depende de cookies/sessão do usuário.
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

