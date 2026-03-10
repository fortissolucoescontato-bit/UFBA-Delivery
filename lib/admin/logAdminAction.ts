import { createAdminClient } from '@/utils/supabase/admin'

type AdminContext = {
  id: string
}

type AdminActionPayload = {
  action: string
  targetId?: string
}

/**
 * Registra uma ação administrativa na tabela admin_actions.
 *
 * Usa o client de serviço (service_role) para inserir mesmo quando a
 * RLS restringe inserts a esse papel.
 */
export async function logAdminAction(admin: AdminContext, payload: AdminActionPayload) {
  const supabaseAdmin = createAdminClient()

  await supabaseAdmin.from('admin_actions').insert({
    admin_id: admin.id,
    action: payload.action,
    target_id: payload.targetId ?? null,
  })
}

