import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  if (client) return client

  // [SECURITY/RESILIENCE FIX]
  // Previne falha crítica (Cannot create property 'user' on string) caso o 
  // localStorage fique corrompido com double-stringify ("{...}") durante o dev ou mudança de auth.
  if (typeof window !== 'undefined') {
    try {
      const storageKeys = Object.keys(localStorage).filter(k => k.startsWith('sb-') && k.endsWith('-auth-token'))
      storageKeys.forEach(key => {
        const val = localStorage.getItem(key)
        if (val && val.startsWith('"{') && val.endsWith('}"')) {
          localStorage.removeItem(key)
          console.warn('[CORE_SYSTEM] Sessão fantasma/corrompida detectada e expurgada do LocalStorage.')
        }
      })
    } catch (e) {
      // Ignora silenciosamente se o localStorage estiver inacessível (ex: aba privada estrita)
    }
  }

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xxx.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'xxx'
  )

  return client
}
