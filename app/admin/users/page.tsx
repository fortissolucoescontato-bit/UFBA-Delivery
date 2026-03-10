import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/utils/supabase/admin'
import { banUser } from '@/app/admin/actions'

type UserRow = {
  id: string
  full_name: string | null
  current_location: string | null
  role: string | null
  subscription_tier: string | null
}

export const revalidate = 0

export default async function AdminUsersPage() {
  await requireAdmin()
  const supabaseAdmin = createAdminClient()

  const { data: users } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, current_location, role, subscription_tier')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Usuários</h2>
        <p className="mt-1 text-sm text-slate-500">
          Lista de perfis cadastrados. Você pode banir usuários marcando seu papel como{' '}
          <code className="px-1 py-0.5 rounded bg-slate-100 text-[11px]">banned</code>, o que pode
          ser usado para desligar o acesso na aplicação.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-[0.12em]">
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Campus</th>
              <th className="px-4 py-2">Papel</th>
              <th className="px-4 py-2">Plano</th>
              <th className="px-4 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u: UserRow) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-slate-800">{u.full_name ?? '—'}</td>
                <td className="px-4 py-2 text-slate-600">{u.current_location ?? '—'}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                    {u.role ?? 'user'}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-600">{u.subscription_tier ?? 'free'}</td>
                <td className="px-4 py-2 text-right">
                  {u.role !== 'banned' ? (
                    /* CORREÇÃO: Passamos a action diretamente e usamos um input hidden.
                       Isso resolve o erro "Argument of type string is not assignable to parameter of type FormData".
                    */
                    <form action={banUser}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-red-700 hover:bg-red-100"
                      >
                        Banir
                      </button>
                    </form>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Banido
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}