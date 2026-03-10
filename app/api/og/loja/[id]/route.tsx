import { ImageResponse } from '@vercel/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const [{ data: profile }, { data: products }] = await Promise.all([
        supabase.from('profiles').select('full_name, avatar_url, store_description, brand_color, current_location').eq('id', id).single(),
        supabase.from('products').select('id, name, price, image').eq('seller_id', id).order('created_at', { ascending: false }).limit(4)
    ])

    const brandColor = /^#[0-9A-F]{6}$/i.test(profile?.brand_color || '') ? profile!.brand_color : '#635BFF'
    const sellerName = profile?.full_name || 'Vendedor'
    const description = profile?.store_description || 'Produtos selecionados para você'
    const location = profile?.current_location || 'UFBA'
    const productCount = products?.length || 0

    return new ImageResponse(
        (
            <div
                style={{
                    width: '1200px',
                    height: '630px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #0A2540 0%, #1a3a5c 60%, #0A2540 100%)',
                    fontFamily: 'system-ui, sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background glow */}
                <div style={{
                    position: 'absolute', top: -60, left: -60,
                    width: 300, height: 300,
                    borderRadius: '50%',
                    background: `${brandColor}33`,
                    filter: 'blur(80px)',
                    display: 'flex',
                }} />
                <div style={{
                    position: 'absolute', bottom: -80, right: -80,
                    width: 400, height: 400,
                    borderRadius: '50%',
                    background: `${brandColor}22`,
                    filter: 'blur(100px)',
                    display: 'flex',
                }} />

                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '40px 60px 0',
                    gap: 24,
                }}>
                    {profile?.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            width={90}
                            height={90}
                            style={{ borderRadius: 20, objectFit: 'cover', border: `3px solid ${brandColor}` }}
                        />
                    ) : (
                        <div style={{
                            width: 90, height: 90, borderRadius: 20,
                            background: brandColor, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: 40, color: 'white',
                        }}>🏪</div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ color: 'white', fontSize: 42, fontWeight: 900, letterSpacing: -1 }}>
                                {sellerName}
                            </span>
                            <span style={{
                                background: brandColor, color: 'white',
                                padding: '4px 12px', borderRadius: 8,
                                fontSize: 14, fontWeight: 800, letterSpacing: 2
                            }}>
                                VERIFICADO
                            </span>
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, fontWeight: 600, marginTop: 4 }}>
                            📍 {location} • UFBA Delivery
                        </span>
                    </div>

                    {/* Logo UFBA Delivery */}
                    <div style={{
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: 16, padding: '10px 20px',
                        border: '1px solid rgba(255,255,255,0.12)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                    }}>
                        <span style={{ color: brandColor, fontSize: 14, fontWeight: 900, letterSpacing: 2 }}>UFBA</span>
                        <span style={{ color: 'white', fontSize: 14, fontWeight: 900, letterSpacing: 2 }}>DELIVERY</span>
                    </div>
                </div>

                {/* Description */}
                <div style={{ padding: '20px 60px 0', display: 'flex' }}>
                    <span style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: 20, fontWeight: 500,
                        maxWidth: 700,
                        lineHeight: 1.5,
                    }}>
                        {description.length > 100 ? description.slice(0, 100) + '...' : description}
                    </span>
                </div>

                {/* Divider */}
                <div style={{
                    margin: '24px 60px',
                    height: 1,
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                }} />

                {/* Products Grid */}
                <div style={{ padding: '0 60px', display: 'flex', gap: 16, flex: 1 }}>
                    {(products || []).slice(0, 4).map((product) => (
                        <div key={product.id} style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: 20,
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}>
                            <img
                                src={product.image}
                                style={{ width: '100%', height: 160, objectFit: 'cover' }}
                            />
                            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <span style={{
                                    color: 'white', fontSize: 16, fontWeight: 800,
                                    overflow: 'hidden', display: '-webkit-box',
                                    WebkitLineClamp: 2, lineHeight: 1.3,
                                }}>
                                    {product.name}
                                </span>
                                <span style={{
                                    color: brandColor, fontSize: 18, fontWeight: 900,
                                    marginTop: 'auto', paddingTop: 8,
                                }}>
                                    R$ {Number(product.price).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                    {productCount === 0 && (
                        <div style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'rgba(255,255,255,0.3)', fontSize: 20,
                        }}>
                            Nenhum produto ainda
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '20px 60px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: 600 }}>
                        {productCount > 0 ? `${productCount} produto${productCount !== 1 ? 's' : ''} disponível${productCount !== 1 ? 'is' : ''}` : ''}
                    </span>
                    <div style={{
                        background: brandColor,
                        borderRadius: 12, padding: '10px 24px',
                        display: 'flex',
                    }}>
                        <span style={{ color: 'white', fontSize: 16, fontWeight: 900, letterSpacing: 1 }}>
                            ufba-delivery.vercel.app
                        </span>
                    </div>
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    )
}
