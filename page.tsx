import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

export default async function HomePage() {
  const supabase = createServerSupabase();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main>
      <section className="hero">
        <div className="container hero-card">
          <div>
            <div className="badge">⚡ SmartZone Production</div>
            <h1>Сильна основа для реального магазину</h1>
            <p>
              Next.js, Vercel, Supabase, серверні API, окрема адмінка,
              збереження замовлень у базі та перевірка статусу замовлення.
            </p>
            <div className="nav-links">
              <Link href="#catalog" className="btn">Відкрити каталог</Link>
              <Link href="/track" className="ghost">Перевірити замовлення</Link>
            </div>
          </div>
          <div className="phone-stack">
            <div className="device one" />
            <div className="device two" />
            <div className="device three" />
          </div>
        </div>
      </section>

      <section className="section" id="catalog">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Каталог товарів</h2>
              <p className="muted">Товари читаються із Supabase.</p>
            </div>
          </div>

          <div className="products">
            {(products ?? []).map((product) => (
              <article className="card" key={product.id}>
                <img src={product.image_url} alt={product.title} />
                <div className="card-body stack">
                  <strong>{product.title}</strong>
                  <div className="muted">{product.brand} • {product.category}</div>
                  <div>
                    <div className="price">{formatPrice(product.price)}</div>
                    {product.old_price ? <div className="old">{formatPrice(product.old_price)}</div> : null}
                  </div>
                  <Link href={`/product/${product.id}`} className="btn">Детальніше</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
