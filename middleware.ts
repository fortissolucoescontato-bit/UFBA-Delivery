import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // A execução da middleware de autenticação intercepta a Request,
  // renova a sessão (evitando deslogamento precoce pela expiração do cookie)
  // e bloqueia/redireciona em rotas seguras se o usuário não for autorizado.
  return await updateSession(request)
}

// O Config Matcher otimizado ignora rotas estáticas para não gerar custo
// de invocação de middleware desnecessário e lentidão global.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
