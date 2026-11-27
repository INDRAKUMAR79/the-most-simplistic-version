import { useEffect, useState } from 'react';
import type { Product } from '../types';
import { ProductImage } from './ProductImage';
import { StarRating } from './StarRating';

interface ProductModalProps {
  product: Product | null;
  deliveryLocation: string;
  isSaved: boolean;
  cartQuantity?: number;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onToggleSave: (productId: string) => void;
}

export function ProductModal({
  product,
  deliveryLocation,
  isSaved,
  cartQuantity = 0,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleSave,
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setJustAdded(false);
  }, [product?.id]);

  if (!product) return null;

  const remainingStock = Math.max(0, product.stockLeft - cartQuantity);
  const maxSelectable = Math.max(1, Math.min(10, remainingStock));
  const safeQuantity = Math.min(quantity, maxSelectable);
  const outOfStock = remainingStock <= 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-primary/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
      onClick={onClose}
    >
      <div
        className="bg-surface-card text-on-surface-card max-w-4xl w-full rounded-sm shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-gutter-lg py-gutter-md border-b border-outline bg-surface-subtle">
          <span className="font-label text-label-sm text-on-surface-muted">
            {product.brand} Official Store
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="w-8 h-8 rounded-sm hover:bg-outline/40 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-title-md">
              close
            </span>
          </button>
        </div>

        <div className="overflow-y-auto p-gutter-xl grid grid-cols-1 md:grid-cols-2 gap-gutter-xl">
          <div className="bg-surface-subtle rounded-sm p-6 flex items-center justify-center min-h-[280px]">
            <ProductImage
              src={product.image}
              alt={product.imageAlt}
              className="w-full max-h-[320px] object-contain"
            />
          </div>

          <div className="flex flex-col gap-gutter-md">
            <div>
              <h2
                id="pdp-title"
                className="font-headline text-headline-md text-on-surface-card mb-1"
              >
                {product.title}
              </h2>
              <div className="flex items-center gap-2">
                <StarRating rating={product.rating} />
                <span className="font-label text-label-sm text-secondary tabular-nums">
                  {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString('en-SG')}{' '}
                  ratings)
                </span>
              </div>
            </div>

            <div className="border-y border-outline py-gutter-md flex flex-col gap-1">
              <div className="flex items-baseline gap-2 tabular-nums">
                {product.discountPercent && (
                  <span className="font-label text-title-md text-deal-red font-bold">
                    -{product.discountPercent}%
                  </span>
                )}
                <span className="font-headline text-headline-lg text-on-surface-card">
                  S$
                  {product.price.toLocaleString('en-SG', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                {product.originalPrice && (
                  <span className="font-body text-body-sm text-on-surface-muted line-through">
                    List: S$
                    {product.originalPrice.toLocaleString('en-SG', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                )}
              </div>
              <p className="font-body text-body-sm text-on-surface-muted">
                {product.deliveryText} &middot; Deliver to {deliveryLocation}
              </p>
              <p
                className={`font-label text-label-sm ${
                  outOfStock ? 'text-deal-red' : 'text-success'
                }`}
              >
                {outOfStock
                  ? 'Maximum available stock in cart'
                  : `In Stock (${remainingStock} available)`}
              </p>
            </div>

            <p className="font-body text-body-md text-on-surface-card">
              {product.description}
            </p>

            <ul className="list-disc pl-5 flex flex-col gap-1 font-body text-body-sm text-on-surface-muted">
              {product.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <label className="flex items-center gap-2 font-label text-label-sm">
                <span>Qty:</span>
                <select
                  value={safeQuantity}
                  disabled={outOfStock}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="bg-surface-subtle border border-outline rounded-sm px-2.5 py-1.5 font-body text-body-sm"
                >
                  {Array.from({ length: maxSelectable }, (_, i) => i + 1).map(
                    (num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <button
                type="button"
                disabled={outOfStock}
                onClick={() => {
                  onAddToCart(product, safeQuantity);
                  setJustAdded(true);
                  window.setTimeout(() => setJustAdded(false), 1200);
                }}
                className={`flex-1 min-w-[140px] py-2 px-4 rounded-full font-label text-label-lg cursor-pointer transition-colors duration-state-change disabled:opacity-50 ${
                  justAdded
                    ? 'bg-success text-on-success'
                    : 'bg-tertiary text-on-tertiary hover:bg-accent'
                }`}
              >
                {justAdded ? 'Added to Cart' : 'Add to Cart'}
              </button>

              <button
                type="button"
                disabled={outOfStock}
                onClick={() => {
                  onBuyNow(product, safeQuantity);
                  onClose();
                }}
                className="flex-1 min-w-[140px] bg-accent text-on-tertiary hover:opacity-90 py-2 px-4 rounded-full font-label text-label-lg cursor-pointer disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>

            <button
              type="button"
              onClick={() => onToggleSave(product.id)}
              className="self-start font-label text-label-sm text-secondary hover:text-accent hover:underline cursor-pointer"
            >
              {isSaved ? 'Remove from Saved List' : 'Add to List'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
