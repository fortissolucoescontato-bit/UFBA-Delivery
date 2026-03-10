import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/utils/supabase/admin'
import { toggleProductVisibility } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'

// 1. Tipo atualizado com is_active para controlar a moderação
type ProductRow = {
  id: string
  name: string
  price: number
  category: string | null
  subcategory: string | null
  created_at: string
  is_active: boolean // Novo campo
  profiles: {
    id: string
    full_name: string | null
  }[] | null 
}

export const revalidate = 0

export default async function AdminProductsPage() {
  await requireAdmin()
  const supabaseAdmin = createAdminClient()

  // Adicionamos 'is_active' no select
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, name, price, category, subcategory, created_at, is_active, profiles ( id, full_name )')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Produtos</h2>
        <p className="mt-1 text-sm text-slate-500">
          Gerencie a visibilidade dos produtos. Produtos ocultados não aparecem para os alunos no feed.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-[0.12em]">
              <th className="px-4 py-2">Produto</th>
              <th className="px-4 py-2">Vendedor</th>
              <th className="px-4 py-2">Categoria</th>
              <th className="px-4 py-2">Preço</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {(products as unknown as ProductRow[])?.map((p) => {
              const profile = Array.isArray(p.profiles) ? p.profiles[0] : null;

              return (
                <tr key={p.id} className={`border-b border-slate-100 last:border-0 ${!p.is_active ? 'bg-red-50/50' : ''}`}>
                  <td className="px-4 py-2 text-slate-800 font-medium">
                    <Link
                      href={`/produto/${p.id}`}
                      className="underline decoration-slate-300 hover:decoration-slate-500"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {profile?.full_name ?? '—'}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {p.category ?? '—'}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    R$ {(Number(p.price) / 100).toFixed(2).replace('.', ',')}
                  </td>
                  <td className="px-4 py-2">
                    {p.is_active ? (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Visível</span>
                    ) : (
                      <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase">Oculto</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <form action={toggleProductVisibility}>
                      <input type="hidden" name="productId" value={p.id} />
                      <input type="hidden" name="currentStatus" value={String(p.is_active)} />
                      
                      <Button 
                        type="submit" 
                        variant={p.is_active ? "ghost" : "default"}
                        size="sm"
                        className={p.is_active ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "bg-slate-900 text-white"}
                      >
                        {p.is_active ? "Ocultar" : "Ativar"}
                      </Button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}