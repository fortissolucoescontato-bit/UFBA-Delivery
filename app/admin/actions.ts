'use server'

import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/utils/supabase/admin'
import { logAdminAction } from '@/lib/admin/logAdminAction'
import { revalidatePath } from 'next/cache'

/**
 * Aprova um vendedor e atualiza o status no banco
 */
export async function approveSeller(formData: FormData) {
  const userId = formData.get('sellerId') as string
  if (!userId) return

  const { profile: adminProfile } = await requireAdmin()
  const supabaseAdmin = createAdminClient()

  await supabaseAdmin
    .from('profiles')
    .update({ 
      role: 'seller',
      is_approved: true 
    })
    .eq('id', userId)

  await logAdminAction(
    { id: adminProfile.id },
    {
      action: 'APPROVE_SELLER',
      targetId: userId,
    },
  )

  revalidatePath('/admin/vendedores')
}

/**
 * Bloqueia um vendedor (rebaixa para usuário comum)
 */
export async function blockSeller(formData: FormData) {
  const userId = formData.get('sellerId') as string
  if (!userId) return

  const { profile: adminProfile } = await requireAdmin()
  const supabaseAdmin = createAdminClient()

  await supabaseAdmin
    .from('profiles')
    .update({ 
      role: 'user',
      is_approved: false 
    })
    .eq('id', userId)

  await logAdminAction(
    { id: adminProfile.id },
    {
      action: 'BLOCK_SELLER',
      targetId: userId,
    },
  )

  revalidatePath('/admin/vendedores')
}

/**
 * Bane um usuário permanentemente
 */
export async function banUser(formData: FormData) {
  const userId = formData.get('userId') as string
  if (!userId) return

  const { profile: adminProfile } = await requireAdmin()
  const supabaseAdmin = createAdminClient()

  await supabaseAdmin
    .from('profiles')
    .update({ role: 'banned' })
    .eq('id', userId)

  await logAdminAction(
    { id: adminProfile.id },
    {
      action: 'BAN_USER',
      targetId: userId,
    },
  )

  revalidatePath('/admin/vendedores')
  revalidatePath('/admin/users')
}

/**
 * Alterna a visibilidade de um produto (MODERAÇÃO)
 */
export async function toggleProductVisibility(formData: FormData) {
  const productId = formData.get('productId') as string
  const currentStatus = formData.get('currentStatus') === 'true'
  
  if (!productId) return

  const { profile: adminProfile } = await requireAdmin()
  const supabaseAdmin = createAdminClient()

  // Inverte o status: se está ativo, desativa. Se está desativado, ativa.
  const { error } = await supabaseAdmin
    .from('products')
    .update({ is_active: !currentStatus }) 
    .eq('id', productId)

  if (!error) {
    await logAdminAction(
      { id: adminProfile.id },
      { 
        action: currentStatus ? 'HIDE_PRODUCT' : 'SHOW_PRODUCT', 
        targetId: productId 
      }
    )
  }
  
  revalidatePath('/admin/products')
}