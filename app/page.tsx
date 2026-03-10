import Link from "next/link";
import { TrendingUp, Store, ArrowRight, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { NavbarPremium } from "@/components/NavbarPremium";
import { config, getAdminWhatsAppLink } from "@/lib/config";

export const revalidate = 0;

export default async function Home(props: {
  searchParams: Promise<{ location?: string; category?: string; subcategory?: string; q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const selectedLocation = searchParams.location;
  const selectedCategory = searchParams.category;
  const selectedSubcategory = searchParams.subcategory;
  const searchQuery = searchParams.q?.toLowerCase();

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const [{ data: products }, { data: topSellersData }, { count: totalSellers }] = await Promise.all([
    supabase
      .from("products")
      .select("*, profiles(full_name, whatsapp, is_online, current_location, brand_color, subscription_tier)")
      .eq("is_active", true) // SEGURANÇA: Somente produtos não ocultados pelo admin aparecem
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("seller_id")
      .gt("created_at", oneMonthAgo.toISOString()),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_online", true),
  ]);

  // Social proof numbers
  const totalProducts = products?.length ?? 0;
  const activeSellers = totalSellers ?? 0;

  // Top sellers
  const sellerCounts: Record<string, number> = {};
  topSellersData?.forEach((order) => {
    if (order.seller_id) {
      sellerCounts[order.seller_id] = (sellerCounts[order.seller_id] || 0) + 1;
    }
  });

  const sortedSellerIds = Object.entries(sellerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([id]) => id);

  const filteredProductsRaw =
    products?.filter((p) => {
      if (!p.seller_id) return false;
      const isOnline = p.profiles?.is_online !== false;
      const matchesLocation = !selectedLocation || p.profiles?.current_location === selectedLocation;
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesSubcategory = !selectedSubcategory || p.subcategory === selectedSubcategory;
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery) ||
        p.profiles?.full_name?.toLowerCase().includes(searchQuery);
      return isOnline && matchesLocation && matchesCategory && matchesSubcategory && matchesSearch;
    }) || [];

  const filteredProducts = [...filteredProductsRaw].sort((a, b) => {
    const tierA = a.profiles?.subscription_tier === "elite" ? 1 : 0;
    const tierB = b.profiles?.subscription_tier === "elite" ? 1 : 0;
    return tierB - tierA;
  });

  const boostedProducts = filteredProducts.filter((p) => p.is_boosted);
  const topSellersProducts = filteredProducts.filter(
    (p) => sortedSellerIds.includes(p.seller_id) && !p.is_boosted
  );
  const recentProducts = filteredProducts.filter(
    (p) => !p.is_boosted && !sortedSellerIds.includes(p.seller_id)
  );

  const isFiltering = selectedCategory || selectedLocation || searchQuery;

  return (
    <main className="min-h-screen bg-background pb-32 font-sans selection:bg-brand-primary selection:text-white">
      <NavbarPremium />

      {/* HERO — Conversão Máxima */}
      <section className="relative pt-28 pb-10 overflow-hidden px-4">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-[15%] w-[45%] h-[70%] bg-brand-primary/15 blur-[140px] rounded-full" />
          <div className="absolute top-[5%] right-[10%] w-[35%] h-[55%] bg-cyan-400/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-6 animate-reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <p className="text-xs font-black tracking-[0.2em] text-emerald-700 uppercase">
              {activeSellers > 0 ? `${activeSellers} vendedor${activeSellers !== 1 ? "es" : ""} online agora` : "Mercado universitário ao vivo"}
            </p>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-brand-secondary tracking-tighter leading-[0.9] md:leading-[0.85]">
            O Shopping da{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-cyan-500">
              UFBA
            </span>{" "}
            <br className="hidden md:block" />
            chegou.
          </h1>

          <p className="max-w-lg mx-auto text-slate-500 font-medium text-sm md:text-base leading-relaxed">
            Compre e venda para outros estudantes.{" "}
            <strong className="text-brand-secondary font-black">Zero taxas</strong>,{" "}
            entrega no campus e pagamento direto pelo WhatsApp.
          </p>

          {(totalProducts > 0 || activeSellers > 0) && (
            <div className="flex items-center justify-center gap-6 py-1">
              <div className="text-center">
                <p className="text-2xl font-black text-brand-secondary tracking-tighter">{totalProducts}+</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Produtos</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-2xl font-black text-brand-secondary tracking-tighter">0%</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taxas</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-2xl font-black text-brand-secondary tracking-tighter">100%</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No campus</p>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg shadow-brand-primary/10 border border-slate-100 p-1.5">
              <SearchBar />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors underline underline-offset-2"
              >
                <Store className="w-3.5 h-3.5" />
                Quero vender aqui também
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 mt-6 space-y-16">
        <section className="animate-reveal [animation-delay:150ms]">
          <CategoryFilter />
        </section>

        {/* ─── Destaques (Boosted) ─── */}
        {boostedProducts.length > 0 && (
          <section className="space-y-6 animate-reveal [animation-delay:300ms]">
            <SectionHeader
              eyebrow="Em destaque"
              title="Curadoria do Campus"
              badge={{ icon: <Sparkles className="w-3 h-3" />, label: "Selecionados" }}
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {boostedProducts.map((product: any, idx: number) => (
                <div key={product.id} className="animate-reveal" style={{ animationDelay: `${400 + idx * 60}ms` }}>
                  <ProductCard
                    {...product}
                    sellerId={product.seller_id}
                    vendorName={product.profiles?.full_name}
                    price={Number(product.price)}
                    image={product.image || product.image_url}
                    sellerWhatsapp={product.profiles?.whatsapp}
                    sellerLocation={product.profiles?.current_location}
                    brandColor={product.profiles?.brand_color}
                    isBoosted
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Mais Vendidos ─── */}
        {topSellersProducts.length > 0 && !isFiltering && (
          <section className="space-y-6 animate-reveal [animation-delay:350ms]">
            <SectionHeader
              eyebrow="Mais procurados"
              title="Top Vendedores"
              badge={{ icon: <TrendingUp className="w-3 h-3" />, label: "Trending" }}
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {topSellersProducts.slice(0, 8).map((product: any, idx: number) => (
                <div key={product.id} className="animate-reveal" style={{ animationDelay: `${450 + idx * 50}ms` }}>
                  <ProductCard
                    {...product}
                    sellerId={product.seller_id}
                    vendorName={product.profiles?.full_name}
                    price={Number(product.price)}
                    image={product.image || product.image_url}
                    sellerWhatsapp={product.profiles?.whatsapp}
                    sellerLocation={product.profiles?.current_location}
                    brandColor={product.profiles?.brand_color}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Novas Ofertas / Resultados do Filtro ─── */}
        <section className="space-y-6 animate-reveal [animation-delay:400ms]">
          <SectionHeader
            eyebrow={
              selectedLocation
                ? `Localidade: ${selectedLocation}`
                : searchQuery
                ? `Resultados para "${searchParams.q}"`
                : "Adicionados hoje"
            }
            title={
              selectedCategory
                ? selectedCategory
                : searchQuery
                ? `Achamos ${recentProducts.length} resultado${recentProducts.length !== 1 ? "s" : ""}`
                : "Novas Ofertas"
            }
          />

          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
              <div className="text-5xl mb-6">🔍</div>
              <h3 className="text-brand-secondary text-lg font-black tracking-tight">
                Nenhum resultado encontrado
              </h3>
              <p className="text-slate-400 text-sm mt-2 font-medium max-w-xs mx-auto">
                Tente outros termos ou remova os filtros para ver mais produtos.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-brand-primary text-white text-sm font-bold rounded-full hover:bg-brand-secondary transition-colors"
              >
                Ver todos os produtos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {recentProducts.map((product: any, idx: number) => (
                <div
                  key={product.id}
                  className="animate-reveal"
                  style={{ animationDelay: `${500 + idx * 40}ms` }}
                >
                  <ProductCard
                    {...product}
                    sellerId={product.seller_id}
                    vendorName={product.profiles?.full_name}
                    price={Number(product.price)}
                    image={product.image || product.image_url}
                    sellerWhatsapp={product.profiles?.whatsapp}
                    sellerLocation={product.profiles?.current_location}
                    brandColor={product.profiles?.brand_color}
                    isNew={idx < 4}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  badge,
}: {
  eyebrow: string;
  title: string;
  badge?: { icon: React.ReactNode; label: string };
}) {
  return (
    <div className="flex items-end justify-between px-1">
      <div className="space-y-0.5">
        <p className="text-brand-primary text-xs font-black tracking-[0.2em] uppercase">{eyebrow}</p>
        <h2 className="text-2xl md:text-3xl font-black text-brand-secondary tracking-tighter">{title}</h2>
      </div>
      {badge && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary/8 border border-brand-primary/15 mb-1">
          <span className="text-brand-primary">{badge.icon}</span>
          <span className="text-xs font-black text-brand-primary tracking-wider uppercase">{badge.label}</span>
        </div>
      )}
    </div>
  );
}