import { useState } from 'react';
import type { CartItem, MoodRecommendation, Product } from '../types';
import { ProductImage } from './ProductImage';
import { StarRating } from './StarRating';

interface MoodRecommendationsProps {
  cart: CartItem[];
  loading: boolean;
  affirmation: string | null;
  summary: string | null;
  results: MoodRecommendation[];
  onAddToCart: (product: Product) => void;
  onOpenProduct: (product: Product) => void;
  onClear: () => void;
}

export function MoodRecommendations({
  cart,
  loading,
  affirmation,
  summary,
  results,
  onAddToCart,
  onOpenProduct,
  onClear,
}: MoodRecommendationsProps) {
  const [addedId, setAddedId] = useState<string | null>(null);

  if (!loading && results.length === 0) return null;

  const handleAdd = (product: Product) => {
    onAddToCart(product);
    setAddedId(product.id);
    window.setTimeout(() => {
      setAddedId((prev) => (prev === product.id ? null : prev));
    }, 1200);
  };

  return (
    <section
      aria-label="Mood-matched recommendations"
      className="bg-surface-card text-on-surface-card p-gutter-lg shadow-sm w-full"
    >
      <div className="flex items-center justify-between gap-gutter-md mb-gutter-md">
        <h2 className="font-headline text-headline-md text-on-surface-card">
          Picked for your mood today
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="font-body text-body-sm text-secondary hover:text-accent hover:underline cursor-pointer"
        >
          Dismiss
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-md">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="border border-outline rounded-sm p-gutter-md flex flex-col gap-3 animate-pulse"
            >
              <div className="bg-surface-subtle h-40 rounded-sm" />
              <div className="h-4 bg-surface-subtle rounded w-3/4" />
              <div className="h-4 bg-surface-subtle rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-gutter-md">
          {affirmation && (
            <div className="bg-surface-subtle border border-outline rounded-sm px-gutter-lg py-gutter-md flex items-start gap-gutter-md">
              <span
                className="material-symbols-outlined text-title-md text-secondary mt-0.5 shrink-0"
                aria-hidden="true"
              >
                wb_sunny
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="font-label text-label-sm text-secondary">
                  Daily positive affirmation
                </span>
                <p className="font-body text-title-md text-on-surface-card text-pretty">
                  &ldquo;{affirmation}&rdquo;
                </p>
              </div>
            </div>
          )}

          {summary && (
            <p className="font-body text-body-md text-on-surface-card font-medium">
              {summary}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-md items-stretch">
            {results.map(({ product, reason }) => {
              const isAdded = addedId === product.id;
              const inCartQty =
                cart.find((item) => item.productId === product.id)?.quantity ?? 0;
              const availableQty = Math.max(0, product.stockLeft - inCartQty);
              const outOfStock = availableQty <= 0;

              return (
                <article
                  key={product.id}
                  className="border border-outline hover:border-secondary rounded-sm p-gutter-md flex flex-col justify-between gap-gutter-sm bg-surface-card transition-colors duration-state-change"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => onOpenProduct(product)}
                      className="w-full text-left cursor-pointer group"
                    >
                      <div className="bg-surface-subtle h-40 flex items-center justify-center p-3 mb-gutter-sm rounded-sm">
                        <ProductImage
                          src={product.image}
                          alt={product.imageAlt}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-state-change"
                        />
                      </div>
                      <h3 className="font-body text-body-md font-semibold text-on-surface-card line-clamp-2 mb-1 group-hover:text-secondary">
                        {product.title}
                      </h3>
                    </button>

                    <div className="flex items-center gap-1 mb-1">
                      <StarRating rating={product.rating} />
                      <span className="font-label text-label-sm text-secondary tabular-nums ml-1">
                        {product.reviewCount.toLocaleString('en-SG')}
                      </span>
                    </div>

                    <p className="font-body text-body-sm text-on-surface-muted mb-2 line-clamp-3">
                      {reason}
                    </p>

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

                    <p
                      className={`font-label text-label-sm tabular-nums mt-1 ${
                        outOfStock || availableQty <= 5
                          ? 'text-deal-red font-medium'
                          : 'text-success'
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
        </div>
      )}
    </section>
  );
}
