import { useMemo, useState } from 'react';
import { PRODUCTS } from '../data/catalog';
import type { CartItem, CategoryId, Product } from '../types';
import { ProductImage } from './ProductImage';

interface TodaysDealsRowProps {
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onOpenProduct: (product: Product) => void;
  onSelectCategory: (category: CategoryId | null) => void;
}

export function TodaysDealsRow({
  cart,
  onAddToCart,
  onOpenProduct,
  onSelectCategory,
}: TodaysDealsRowProps) {
  const [addedId, setAddedId] = useState<string | null>(null);

  const topFiveDeals = useMemo(() => {
    return PRODUCTS.filter((product) => product.isDeal)
      .sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0))
      .slice(0, 5);
  }, []);

  const handleAdd = (product: Product) => {
    onAddToCart(product);
    setAddedId(product.id);
    window.setTimeout(() => {
      setAddedId((prev) => (prev === product.id ? null : prev));
    }, 1200);
  };

  return (
    <section
      id="deals"
      aria-label="Today's Deals"
      className="bg-surface-card text-on-surface-card p-gutter-lg shadow-sm w-full"
    >
      <div className="flex items-baseline justify-between mb-gutter-md">
        <div className="flex items-baseline gap-gutter-md">
          <h2 className="font-headline text-headline-md text-on-surface-card">
            Today&apos;s Deals
          </h2>
          <button
            type="button"
            onClick={() => onSelectCategory('deals')}
            className="font-body text-body-sm text-secondary hover:text-accent hover:underline cursor-pointer"
          >
            See all deals
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-gutter-md items-stretch">
        {topFiveDeals.map((product) => {
          const isAdded = addedId === product.id;
          const inCartQty =
            cart.find((item) => item.productId === product.id)?.quantity ?? 0;
          const availableQty = Math.max(0, product.stockLeft - inCartQty);
          const outOfStock = availableQty <= 0;

          return (
            <article
              key={product.id}
              className="border border-outline rounded-sm p-gutter-md flex flex-col justify-between gap-gutter-sm bg-surface-card hover:border-secondary transition-colors duration-state-change"
            >
              <div>
                <button
                  type="button"
                  onClick={() => onOpenProduct(product)}
                  className="w-full text-left cursor-pointer group"
                >
                  <div className="bg-surface-subtle h-44 flex items-center justify-center p-3 mb-gutter-sm rounded-sm">
                    <ProductImage
                      src={product.image}
                      alt={product.imageAlt}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-state-change"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-gutter-xs mb-1">
                    {product.discountPercent && (
                      <span
                        role="status"
                        className="inline-flex items-center bg-deal-red text-on-deal-red font-label text-label-sm px-2 py-0.5 rounded-sm tabular-nums"
                      >
                        <span className="font-label text-label-sm">
                          {product.discountPercent}% off
                        </span>
                      </span>
                    )}
                    {product.dealLabel && (
                      <span className="font-label text-label-sm text-deal-red">
                        {product.dealLabel}
                      </span>
                    )}
                  </div>
                  <h3 className="font-body text-body-md text-on-surface-card line-clamp-2 mb-1 group-hover:text-secondary">
                    {product.title}
                  </h3>
                </button>

                <div className="flex items-baseline gap-gutter-xs tabular-nums">
                  <span className="font-headline text-headline-sm text-on-surface-card">
                    S$
                    {product.price.toLocaleString('en-SG', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  {product.originalPrice && (
                    <span className="font-label text-label-sm text-on-surface-muted line-through">
                      S$
                      {product.originalPrice.toLocaleString('en-SG', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  )}
                </div>

                <p className="font-label text-label-sm text-success mt-0.5">
                  {product.deliveryText}
                </p>
                <p
                  className={`font-label text-label-sm tabular-nums mt-0.5 ${
                    outOfStock || availableQty <= 5
                      ? 'text-deal-red font-medium'
                      : 'text-on-surface-muted'
                  }`}
                >
                  {outOfStock
                    ? '0 available (max in cart)'
                    : `${availableQty} available`}
                </p>
              </div>

              <button
                type="button"
                disabled={outOfStock}
                onClick={() => handleAdd(product)}
                className={`w-full font-label text-label-sm py-1.5 px-3 rounded-full transition-colors duration-state-change cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAdded
                    ? 'bg-success text-on-success'
                    : 'bg-tertiary text-on-tertiary hover:bg-accent'
                }`}
              >
                {outOfStock
                  ? 'Max in Cart'
                  : isAdded
                    ? 'Added to Cart'
                    : 'Add to Cart'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
