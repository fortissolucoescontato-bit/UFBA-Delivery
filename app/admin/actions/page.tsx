import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/utils/supabase/admin'

// Tipagem corrigida: profiles agora é um Array de objetos conforme o retorno do Supabase
type AdminActionRow = {
  id: string
  action: string
  target_id: string | null
  created_at: string
  profiles: {
    full_name: string | null
  }[] | null 
}

export const revalidate = 0

export default async function AdminActionsLogPage() {
  await requireAdmin()
  const supabaseAdmin = createAdminClient()

  // O Supabase retorna um array para relações (joins)
  const { data: actions } = await supabaseAdmin
    .from('admin_actions')
    .select('id, action, target_id, created_at, profiles ( full_name )')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Auditoria</h2>
        <p className="mt-1 text-sm text-slate-500">
          Últimas ações administrativas registradas na tabela{' '}
          <code className="px-1 py-0.5 rounded bg-slate-100 text-[11px]">admin_actions</code>.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-[0.12em]">
              <th className="px-4 py-2">Quando</th>
              <th className="px-4 py-2">Admin</th>
              <th className="px-4 py-2">Ação</th>
              <th className="px-4 py-2">Alvo</th>
            </tr>
          </thead>
          <tbody>
            {(actions as unknown as AdminActionRow[])?.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-slate-600">
                  {new Date(a.created_at).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-2 text-slate-800">
                  {/* Acessamos o primeiro item do array [0] de forma segura */}
                  {Array.isArray(a.profiles) && a.profiles.length > 0 
                    ? a.profiles[0].full_name 
                    : '—'}
                </td>
                <td className="px-4 py-2 font-mono text-xs text-slate-700">
                  {a.action}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {a.target_id ?? '—'}
                </td>
              </tr>
            ))}
            {(!actions || actions.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  Nenhuma ação registrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}