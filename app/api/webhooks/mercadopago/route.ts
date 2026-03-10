import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Moved dynamic IDs inside functions/constants for testability
const getPlatformAdminId = () => process.env.PLATFORM_ADMIN_ID || '00000000-0000-0000-0000-000000000000';

function verifyWebhookSignature(request: Request, dataId: string): boolean {
    const signature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');
    
    if (!signature || !xRequestId) return false;

    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret) return false;

    try {
        const parts = signature.split(',');
        const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1];
        const hash = parts.find(p => p.startsWith('v1='))?.split('=')[1];
        
        if (!ts || !hash) return false;

        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(manifest);
        const expectedHash = hmac.digest('hex');
        
        return hash === expectedHash;
    } catch {
        return false;
    }
}

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('data.id') || searchParams.get('id');

    if (type !== 'payment' || !id) {
        return NextResponse.json({ received: true });
    }

    if (!verifyWebhookSignature(request, id)) {
        console.error('[SECURITY] Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error("[WEBHOOK ERROR]: Missing environment variables");
            return NextResponse.json({ status: 'error' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Buscar o token secreto do Admin a partir da tabela dedicada
        const { data: adminSecret } = await supabaseAdmin
            .from('profile_mp_credentials')
            .select('mp_access_token')
            .eq('profile_id', getPlatformAdminId())
            .single();

        if (!adminSecret?.mp_access_token) {
            throw new Error("Admin access token not found");
        }

        const client = new MercadoPagoConfig({ accessToken: adminSecret.mp_access_token });
        const payment = new Payment(client);

        // 2. Verificar o status do pagamento no MP
        const paymentData = await payment.get({ id });

        if (paymentData.status === 'approved') {
            const metadata = paymentData.metadata;
            const sellerId = metadata?.seller_id;
            const paymentType = metadata?.payment_type;

            if (!sellerId) throw new Error("Seller ID missing in metadata");
            
            const adminId = getPlatformAdminId();

            if (paymentData.external_reference !== adminId) {
                console.error('[SECURITY] Payment external_reference mismatch');
                return NextResponse.json({ error: 'Invalid payment' }, { status: 403 });
            }

            if (paymentType === 'elite_plan') {
                const { error: insertError } = await supabaseAdmin
                    .from('processed_webhooks')
                    .insert({
                        payment_id: id,
                        seller_id: sellerId,
                        payment_type: 'elite_plan'
                    });

                if (insertError?.code === '23505') {
                    console.warn(`[WEBHOOK] Duplicate payment ${id} rejected`);
                    return NextResponse.json({ status: 'already_processed' });
                }

                if (insertError) throw insertError;

                await supabaseAdmin
                    .from('profiles')
                    .update({
                        subscription_tier: 'elite',
                        elite_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    })
                    .eq('id', sellerId);

                console.log(`[ELITE] Plan activated for seller ${sellerId}`);
            }

            else if (paymentType === 'boost_spotlight') {
                const productId = metadata?.product_id;
                if (!productId) throw new Error("Product ID missing for boost");

                const { data: product } = await supabaseAdmin
                    .from('products')
                    .select('seller_id')
                    .eq('id', productId)
                    .single();

                if (product?.seller_id !== sellerId) {
                    console.error('[SECURITY] Product ownership mismatch');
                    return NextResponse.json({ error: 'Invalid product' }, { status: 403 });
                }

                const { error: insertError } = await supabaseAdmin
                    .from('processed_webhooks')
                    .insert({
                        payment_id: id,
                        seller_id: sellerId,
                        payment_type: 'boost_spotlight',
                        product_id: productId
                    });

                if (insertError?.code === '23505') {
                    console.warn(`[WEBHOOK] Duplicate boost payment ${id} rejected`);
                    return NextResponse.json({ status: 'already_processed' });
                }

                if (insertError) throw insertError;

                await supabaseAdmin
                    .from('products')
                    .update({
                        is_boosted: true,
                        boost_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                    })
                    .eq('id', productId)
                    .eq('seller_id', sellerId);

                console.log(`[BOOST] Product ${productId} boosted for 24h`);
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error: any) {
        console.error("[WEBHOOK ERROR]:", { code: error?.code, message: error?.message });
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}
