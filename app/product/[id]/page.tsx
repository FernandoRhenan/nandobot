import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";
import CouponCode from "@/components/CouponCode";
import CouponFormater from "@/helpers/CouponFormater";
import DateFormater from "@/helpers/DateFormater";
import PriceFormater from "@/helpers/PriceFormater";
import Products, { TCreatedProductAndUrl } from "@/models/products";
import intId from "@/validators/intId";

export const dynamic = "force-dynamic";

interface IProductPageProps {
  params: Promise<{ id: string }>;
}

const getProduct = cache(
  async (id: string): Promise<TCreatedProductAndUrl | null> => {
    const validatedId = intId.safeParse(Number(id));

    if (!validatedId.success) return null;

    const products = new Products();
    const product = await products.getProductById(validatedId.data);

    return product ?? null;
  },
);

function getFinalPrice(product: TCreatedProductAndUrl): number {
  if (!product.coupons || product.coupons.length === 0)
    return product.current_price;

  return CouponFormater.applyDiscount(product.current_price, product.coupons);
}

function getDiscountPercentage(
  oldPrice: number | null,
  finalPrice: number,
): number | null {
  if (!oldPrice || oldPrice <= finalPrice) return null;

  return Math.round(((oldPrice - finalPrice) / oldPrice) * 100);
}

export async function generateMetadata({
  params,
}: IProductPageProps): Promise<Metadata> {
  const product = await getProduct((await params).id);

  if (!product)
    return {
      title: `Produto não encontrado | ${process.env.NEXT_PUBLIC_HEAD_NAME}`,
    };

  const price = PriceFormater.formatNumberToString(getFinalPrice(product));
  const description = `${product.name} por ${price}. Confira a oferta antes que acabe.`;

  return {
    title: `${product.name} por ${price} | ${process.env.NEXT_PUBLIC_HEAD_NAME}`,
    description,
    openGraph: {
      type: "website",
      title: `${product.name} por ${price}`,
      description,
      images: [{ url: product.image_url, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} por ${price}`,
      description,
      images: [product.image_url],
    },
  };
}

export default async function ProductPage({ params }: IProductPageProps) {
  const product = await getProduct((await params).id);

  if (!product) notFound();

  const coupons = product.coupons ?? [];
  const finalPrice = getFinalPrice(product);
  const discount = getDiscountPercentage(product.old_price, finalPrice);

  return (
    <main className={styles.page}>
      <article className={styles.card}>
        <div className={styles.gallery}>
          <Image
            className={styles.image}
            src={product.image_url}
            alt={product.name}
            width={520}
            height={520}
            priority
          />
          {discount !== null && (
            <span className={styles.discount}>-{discount}%</span>
          )}
        </div>

        <section className={styles.details}>
          <span className={styles.store}>🤝🏼🟡 Mercado Livre</span>
          <h1 className={styles.name}>{product.name}</h1>

          <div className={styles.prices}>
            {product.old_price && (
              <span className={styles.oldPrice}>
                De {PriceFormater.formatNumberToString(product.old_price)}
              </span>
            )}
            <span className={styles.price}>
              {PriceFormater.formatNumberToString(finalPrice)}
            </span>
            {coupons.length > 0 && (
              <span className={styles.priceHint}>
                Preço com {coupons.length > 1 ? "os cupons" : "o cupom"} abaixo
              </span>
            )}
          </div>

          {coupons.length > 0 && (
            <section className={styles.coupons}>
              <h2 className={styles.couponsTitle}>
                {coupons.length > 1 ? "💥 Combo de cupons" : "🏷️ Use o cupom"}
              </h2>
              {coupons.map((coupon) => (
                <CouponCode
                  key={coupon.id}
                  name={coupon.name.toUpperCase()}
                  discount={CouponFormater.formatDiscount(
                    coupon.discount,
                    coupon.discount_type,
                  )}
                  conditions={CouponFormater.formatConditions(
                    coupon.discount_limit,
                    coupon.min_purchase,
                  )}
                />
              ))}
            </section>
          )}

          <a
            className={styles.cta}
            href={product.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            Comprar agora
          </a>

          <p className={styles.warning}>
            ⚠️ A promoção pode acabar a qualquer momento. Confira o preço final
            na página da loja.
          </p>
          <p className={styles.updatedAt}>
            Atualizado em {DateFormater.format(product.updated_at)}
          </p>
        </section>
      </article>
    </main>
  );
}
