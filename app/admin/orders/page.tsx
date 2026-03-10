import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/utils/supabase/admin'

type OrderRow = {
  id: string
  status: string | null
  amount: number | null
  created_at: string
}

export const revalidate = 0

export default async function AdminOrdersPage() {
  await requireAdmin()
  const supabaseAdmin = createAdminClient()

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('id, status, amount, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Pedidos</h2>
        <p className="mt-1 text-sm text-slate-500">
          Lista dos últimos pedidos registrados pelo checkout integrado ao Mercado Pago.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-[0.12em]">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Valor</th>
              <th className="px-4 py-2">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((o: OrderRow) => (
              <tr key={o.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 font-mono text-xs text-slate-700">{o.id}</td>
                <td className="px-4 py-2 text-slate-700">{o.status ?? '—'}</td>
                <td className="px-4 py-2 text-slate-700">
                  {o.amount != null
                    ? `R$ ${(Number(o.amount) / 100).toFixed(2).replace('.', ',')}`
                    : '—'}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {new Date(o.created_at).toLocaleString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

