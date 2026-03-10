import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

/**
 * Motor de Pagamentos Mercado Pago (ECLIPSE V10)
 * Este módulo gerencia a criação de preferências de pagamento distribuídas.
 */
export async function createSellerPreference(sellerId: string, item: { title: string, unit_price: number, quantity: number }) {

    // Cliente Administrativo exclusivo para dados sensíveis bancários
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Buscar Credenciais Seguras do Vendedor (Admin Level Bypass)
    const { data: seller } = await supabaseAdmin
        .from('profiles')
        .select('mp_connected, full_name')
        .eq('id', sellerId)
        .single();

    const { data: sellerSecret } = await supabaseAdmin
        .from('profile_mp_credentials')
        .select('mp_access_token')
        .eq('profile_id', sellerId)
        .single();

    if (!seller || !seller.mp_connected || !sellerSecret?.mp_access_token) {
        throw new Error("Vendedor não configurou o Mercado Pago.");
    }

    try {
        // 2. Inicializar SDK com o Token do Vendedor (Dinâmico)
        const client = new MercadoPagoConfig({
            accessToken: sellerSecret.mp_access_token,
            options: { timeout: 5000 }
        });

        const preference = new Preference(client);

        // 3. Criar a Preferência de Checkout Pro
        const response = await preference.create({
            body: {
                items: [
                    {
                        id: `prod-${Date.now()}`,
                        title: item.title,
                        unit_price: item.unit_price,
                        quantity: item.quantity,
                        currency_id: 'BRL'
                    }
                ],
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_SITE_URL}/carrinho?status=success`,
                    failure: `${process.env.NEXT_PUBLIC_SITE_URL}/carrinho?status=failure`,
                    pending: `${process.env.NEXT_PUBLIC_SITE_URL}/carrinho?status=pending`,
                },
                auto_return: 'approved',
                statement_descriptor: seller.full_name?.substring(0, 16) || 'UFBA Delivery',
                notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
                external_reference: sellerId // Para identificar o vendedor no webhook
            }
        });

        return response.init_point;
    } catch (error) {
        console.error("Erro ao criar preferência MP:", error);
        throw error;
    }
}
const PLATFORM_ADMIN_ID = '63678bde-e0cd-4e34-880e-6ea235da0d62';

/**
 * Cria uma preferência de pagamento para a PLATAFORMA (Admin).
 * Usado para Planos Elite e Boost Spotlight.
 */
export async function createAdminPreference(item: { title: string, unit_price: number, quantity: number, metadata?: any }) {
    const supabase = await createClient();

    // 1. Buscar Credenciais do Admin
    const { data: admin } = await supabase
        .from('profiles')
        .select('mp_connected')
        .eq('id', PLATFORM_ADMIN_ID)
        .single();

    const { data: adminSecret } = await supabase
        .from('profile_mp_credentials')
        .select('mp_access_token')
        .eq('profile_id', PLATFORM_ADMIN_ID)
        .single();

    if (!admin || !admin.mp_connected || !adminSecret?.mp_access_token) {
        throw new Error("Admin não configurou o Mercado Pago para recebimento de taxas.");
    }

    try {
        // Cálculo de Markup: Repasse de Taxa (Margem de ~5% para cobrir MP)
        const netAmount = item.unit_price;
        const totalWithFees = Math.ceil((netAmount / 0.95) * 100) / 100;

        const client = new MercadoPagoConfig({
            accessToken: adminSecret.mp_access_token,
            options: { timeout: 5000 }
        });

        const preference = new Preference(client);

        const response = await preference.create({
            body: {
                items: [
                    {
                        id: `admin-${Date.now()}`,
                        title: `${item.title} (Inc. Taxas)`,
                        unit_price: totalWithFees,
                        quantity: item.quantity,
                        currency_id: 'BRL'
                    }
                ],
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_SITE_URL}/vendedor/dashboard?payment=success`,
                    failure: `${process.env.NEXT_PUBLIC_SITE_URL}/vendedor/dashboard?payment=failure`,
                    pending: `${process.env.NEXT_PUBLIC_SITE_URL}/vendedor/dashboard?payment=pending`,
                },
                auto_return: 'approved',
                notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
                external_reference: PLATFORM_ADMIN_ID,
                metadata: {
                    ...item.metadata,
                    is_admin_payment: true,
                    net_amount: netAmount // Guardar o valor original para auditoria
                }
            }
        });

        return response.init_point;
    } catch (error) {
        console.error("Erro ao criar preferência administrativa:", error);
        throw error;
    }
}
