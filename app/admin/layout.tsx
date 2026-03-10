import Link from 'next/link'
import { ReactNode } from 'react'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Package, 
  ShoppingCart, 
  ShieldCheck, 
  ArrowLeft 
} from 'lucide-react'

export const metadata = {
  title: 'Admin | UFBA Delivery',
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireAdmin()

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans selection:bg-brand-primary selection:text-white">
      
      {/* Sidebar (Desktop) / Header com Botão Voltar (Mobile) */}
      <aside className="w-full md:w-64 md:h-screen md:sticky md:top-0 shrink-0 border-b md:border-r border-slate-200 bg-white/90 backdrop-blur-xl z-50">
        <div className="px-6 py-4 flex flex-row md:flex-col justify-between items-center md:items-start border-b md:border-b-0 border-slate-100">
          <div className="flex items-center gap-3">
            {/* Botão de Voltar (Apenas Mobile) - Redireciona para o site principal */}
            <Link 
              href="/" 
              className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600 active:scale-90 transition-transform"
              title="Voltar para o site"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase leading-none">
                Painel Admin
              </p>
              <p className="mt-1 text-sm font-black text-slate-800 truncate max-w-[120px] md:max-w-full">
                {profile.full_name || 'Administrador'}
              </p>
            </div>
          </div>

          <span className="hidden md:inline-flex lg:inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-black text-emerald-700 uppercase tracking-widest">
            Admin
          </span>
          
          {/* Badge minimalista para mobile */}
          <span className="md:hidden h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>

        {/* Navegação Desktop */}
        <nav className="hidden md:block px-3 py-4 space-y-1">
          <NavLink href="/admin" icon={<LayoutDashboard size={18} />}>Visão geral</NavLink>
          <NavLink href="/admin/users" icon={<Users size={18} />}>Usuários</NavLink>
          <NavLink href="/admin/vendedores" icon={<Store size={18} />}>Lojas</NavLink>
          <NavLink href="/admin/products" icon={<Package size={18} />}>Produtos</NavLink>
          <NavLink href="/admin/orders" icon={<ShoppingCart size={18} />}>Pedidos</NavLink>
          <NavLink href="/admin/actions" icon={<ShieldCheck size={18} />}>Auditoria</NavLink>
        </nav>
      </aside>

      {/* Navegação Mobile (Barra Inferior Estilo App) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex justify-around items-center z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <MobileLink href="/admin" icon={<LayoutDashboard size={20} />} label="Início" />
        <MobileLink href="/admin/users" icon={<Users size={20} />} label="Users" />
        <MobileLink href="/admin/vendedores" icon={<Store size={20} />} label="Lojas" />
        <MobileLink href="/admin/products" icon={<Package size={20} />} label="Prod" />
        <MobileLink href="/admin/actions" icon={<ShieldCheck size={20} />} label="Audit" />
      </nav>

      {/* Área de Conteúdo */}
      <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-0">
        {/* Header Desktop (Escondido no Mobile para ganhar espaço) */}
        <header className="hidden md:flex h-14 border-b border-slate-200 bg-white px-6 items-center justify-between">
          <h1 className="text-sm font-black text-slate-800 tracking-tight uppercase">
            UFBA Delivery – Gestão Central
          </h1>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-black text-emerald-700 uppercase tracking-widest">
              Acesso Autorizado
            </span>
          </div>
        </header>

        {/* Onde as páginas são renderizadas */}
        <div className="flex-1 px-4 py-6 md:px-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}

/**
 * Componente de link para o menu lateral (Desktop)
 */
function NavLink({ href, children, icon }: { href: string; children: ReactNode; icon: ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-brand-primary/5 hover:text-brand-primary transition-all active:scale-95 group"
    >
      <span className="opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform">
        {icon}
      </span>
      {children}
    </Link>
  )
}

/**
 * Componente de link para a barra inferior (Mobile)
 */
function MobileLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 px-3 py-1 text-slate-400 hover:text-brand-primary active:text-brand-primary transition-colors"
    >
      <div className="active:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
    </Link>
  )
}