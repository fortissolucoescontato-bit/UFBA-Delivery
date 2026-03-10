import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/utils/supabase/admin'

type CountResult = {
  count: number | null
}

export const revalidate = 0

export default async function AdminDashboardPage() {
  await requireAdmin()
  const supabaseAdmin = createAdminClient()

  const [users, stores, products, orders, pageViews] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .returns<CountResult>(),
    supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_tier', 'elite')
      .returns<CountResult>(),
    supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .returns<CountResult>(),
    supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .returns<CountResult>(),
    supabaseAdmin
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .returns<CountResult>(),
  ])

  const totalUsers = users.count ?? 0
  const eliteStores = stores.count ?? 0
  const totalProducts = products.count ?? 0
  const totalOrders = orders.count ?? 0
  const totalPageViews = pageViews.count ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Visão geral</h2>
        <p className="mt-1 text-sm text-slate-500">
          Panorama global do UFBA Delivery. Estes números são calculados via client de serviço do
          Supabase (fora do escopo de RLS normal).
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Usuários cadastrados" value={totalUsers} />
        <StatCard label="Lojas premium (elite)" value={eliteStores} />
        <StatCard label="Produtos ativos" value={totalProducts} />
        <StatCard label="Pedidos cadastrados" value={totalOrders} />
        <StatCard label="Page views registradas" value={totalPageViews} />
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  )
}

