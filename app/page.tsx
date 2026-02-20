import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { LocationFilter } from "@/components/LocationFilter";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/AppLogo";
import { UserMenu } from "@/components/UserMenu";
import { createClient } from "@/utils/supabase/server";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";

export const revalidate = 0; // Disable static caching for realtime updates

export default async function Home(props: {
  searchParams: Promise<{ location?: string, category?: string, q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const selectedLocation = searchParams.location;
  const selectedCategory = searchParams.category;
  const searchQuery = searchParams.q?.toLowerCase();

  let query = supabase
    .from('products')
    .select('*, profiles(full_name, whatsapp, is_online, current_location, brand_color)')
    .order('created_at', { ascending: false });

  // Apply category filter natively if requested
  if (selectedCategory) {
    query = query.eq('category', selectedCategory);
  }

  const { data: products } = await query;

  // Filter products where seller is online AND matches dynamic parameters
  const onlineProducts = products?.filter(p => {
    const isOnline = p.profiles?.is_online !== false;
    const matchesLocation = !selectedLocation || p.profiles?.current_location === selectedLocation;
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery) ||
      p.profiles?.full_name?.toLowerCase().includes(searchQuery);

    return isOnline && matchesLocation && matchesSearch;
  }) || [];

  const boostedProducts = onlineProducts.filter(p => p.is_boosted);
  const regularProducts = onlineProducts.filter(p => !p.is_boosted);

  return (
    <main className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-20 bg-background/70 backdrop-blur-xl border-b border-border/40 supports-[backdrop-filter]:bg-background/40">
        <div className="flex items-center justify-between p-4 max-w-5xl mx-auto pb-2">
          <AppLogo />
          <UserMenu />
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-2">
          <SearchBar />
        </div>
        <div className="max-w-5xl mx-auto pb-1">
          <CategoryFilter />
        </div>
      </header>

      <div className="p-4 space-y-10 max-w-5xl mx-auto mt-2">
        {boostedProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                <span className="text-primary text-2xl">🔥</span> Destaques
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {boostedProducts.map((product: any) => (
                <div key={product.id}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={Number(product.price)}
                    image={product.image || product.image_url} // Fallback for stability
                    vendorName={product.profiles?.full_name || "Vendedor"}
                    sellerId={product.seller_id}
                    sellerWhatsapp={product.profiles?.whatsapp || ""}
                    sellerLocation={product.profiles?.current_location}
                    brandColor={product.profiles?.brand_color}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {regularProducts.length > 0 ? (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold tracking-tight">📍 Perto de você</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {regularProducts.map((product: any) => (
                <div key={product.id}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={Number(product.price)}
                    image={product.image || product.image_url}
                    vendorName={product.profiles?.full_name || "Vendedor"}
                    sellerId={product.seller_id}
                    sellerWhatsapp={product.profiles?.whatsapp || ""}
                    sellerLocation={product.profiles?.current_location}
                    brandColor={product.profiles?.brand_color}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p>Nenhum produto encontrado.</p>
            <p className="text-sm">Seja o primeiro a vender!</p>
          </div>
        )}
      </div>
    </main>
  );
}
