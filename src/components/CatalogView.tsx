import { useMemo, useState } from 'react';
import { CATEGORY_LABELS, PRODUCTS, SUB_NAV_ITEMS } from '../data/catalog';
import type { CartItem, CategoryId, Product } from '../types';
import { ProductImage } from './ProductImage';
import { StarRating } from './StarRating';

interface CatalogViewProps {
  cart: CartItem[];
  searchQuery: string;
  activeCategory: CategoryId;
  deliveryLocation: string;
  onSelectCategory: (category: CategoryId | null) => void;
  onClearSearch: () => void;
  onAddToCart: (product: Product) => void;
  onOpenProduct: (product: Product) => void;
}

export function CatalogView({
  cart,
  searchQuery,
  activeCategory,
  deliveryLocation,
  onSelectCategory,
  onClearSearch,
  onAddToCart,
  onOpenProduct,
}: CatalogViewProps) {
  const [sortBy, setSortBy] = useState<
    'featured' | 'price-asc' | 'price-desc' | 'rating'
  >('featured');
  const [primeOnly, setPrimeOnly] = useState(activeCategory === 'prime');
  const [addedId, setAddedId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const matches = PRODUCTS.filter((product) => {
      if (primeOnly && !product.isPrime) return false;
      if (activeCategory === 'deals' && !product.isDeal) return false;
      if (activeCategory === 'prime' && !product.isPrime) return false;
      if (
        activeCategory !== 'all' &&
        activeCategory !== 'deals' &&
        activeCategory !== 'prime' &&
        product.category !== activeCategory
      ) {
        return false;
      }
      if (!query) return true;
      return `${product.title} ${product.brand} ${product.category} ${product.description}`
        .toLowerCase()
        .includes(query);
    });

    if (sortBy === 'price-asc') {
      return [...matches].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...matches].sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'rating') {
      return [...matches].sort((a, b) => b.rating - a.rating);
    }
    return matches;
  }, [searchQuery, activeCategory, sortBy, primeOnly]);

  const handleAdd = (product: Product) => {
    onAddToCart(product);
    setAddedId(product.id);
    window.setTimeout(() => {
      setAddedId((prev) => (prev === product.id ? null : prev));
    }, 1200);
  };

  const headingLabel = searchQuery
    ? `Results for "${searchQuery}"`
    : CATEGORY_LABELS[activeCategory] || 'Storefront Catalog';

  const departmentTabs: Array<{ id: CategoryId; label: string }> = [
    { id: 'all', label: 'All Departments' },
    ...SUB_NAV_ITEMS,
  ];

  return (
    <div className="px-page-margin py-gutter-lg flex flex-col gap-gutter-lg">
      <div className="bg-surface-card p-gutter-lg shadow-sm flex flex-col gap-gutter-md">
        <div className="flex flex-wrap items-center justify-between gap-gutter-md border-b border-outline pb-gutter-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-label text-label-sm text-on-surface-muted">
              <button
                type="button"
                onClick={() => onSelectCategory(null)}
                className="text-secondary hover:text-accent hover:underline cursor-pointer"
              >
                Amazon.sg Home
              </button>
              <span aria-hidden="true">/</span>
              <span>{headingLabel}</span>
            </div>
            <h1 className="font-headline text-headline-md text-on-surface-card">
              {headingLabel}{' '}
              <span className="font-body text-body-md text-on-surface-muted tabular-nums">
                ({filteredProducts.length}{' '}
                {filteredProducts.length === 1 ? 'item' : 'items'})
              </span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-gutter-md">
            <label className="flex items-center gap-2 font-body text-body-sm text-on-surface-card cursor-pointer">
              <input
                type="checkbox"
                checked={primeOnly}
                onChange={(event) => setPrimeOnly(event.target.checked)}
                className="rounded-sm border-outline text-secondary focus:ring-secondary"
              />
              <span className="bg-prime-blue text-on-tertiary font-label text-label-sm px-1.5 py-0.5 rounded-sm">
                prime
              </span>
              <span>Eligible</span>
            </label>

            <div className="flex items-center gap-2">
              <label
                htmlFor="catalog-sort"
                className="font-label text-label-sm text-on-surface-muted"
              >
                Sort by:
              </label>
              <select
                id="catalog-sort"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value as
                      | 'featured'
                      | 'price-asc'
                      | 'price-desc'
                      | 'rating',
                  )
                }
                className="bg-surface-subtle border border-outline rounded-sm px-3 py-1.5 font-body text-body-sm text-on-surface-card cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Avg. Customer Review</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                onClearSearch();
                onSelectCategory(null);
              }}
              className="px-3 py-1.5 border border-outline rounded-sm bg-surface-subtle hover:bg-outline/30 font-label text-label-sm text-on-surface-card cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {departmentTabs.map((dept) => {
            const active = activeCategory === dept.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => onSelectCategory(dept.id)}
                className={`px-3 py-1.5 rounded-sm font-label text-label-sm whitespace-nowrap shrink-0 border transition-colors duration-state-change cursor-pointer ${
                  active
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-subtle text-on-surface-card border-outline hover:border-secondary'
                }`}
              >
                {dept.label}
              </button>
            );
          })}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-surface-card p-12 shadow-sm text-center flex flex-col items-center gap-gutter-md">
          <span
            className="material-symbols-outlined text-display-lg text-on-surface-muted"
            aria-hidden="true"
          >
            search_off
          </span>
          <h2 className="font-headline text-headline-md text-on-surface-card">
            No products matched your filter
          </h2>
          <p className="font-body text-body-md text-on-surface-muted max-w-md">
            Try clearing your search term or browsing all Singapore departments
            for Electronics, Books, Fresh groceries, and more.
          </p>
          <button
            type="button"
            onClick={() => {
              onClearSearch();
              onSelectCategory('all');
              setPrimeOnly(false);
            }}
            className="bg-tertiary text-on-tertiary hover:bg-accent font-label text-label-lg px-5 py-2 rounded-full cursor-pointer"
          >
            Show all items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-md items-stretch">
          {filteredProducts.map((product) => {
            const isAdded = addedId === product.id;
            const inCartQty =
              cart.find((item) => item.productId === product.id)?.quantity ?? 0;
            const availableQty = Math.max(0, product.stockLeft - inCartQty);
            const outOfStock = availableQty <= 0;

            return (
              <article
                key={product.id}
                className="bg-surface-card border border-outline hover:border-secondary rounded-sm p-gutter-md flex flex-col justify-between gap-gutter-sm shadow-sm transition-colors duration-state-change"
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

                  <div className="flex items-baseline gap-gutter-xs tabular-nums mb-1">
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

                  <p className="font-body text-label-sm text-on-surface-muted">
                    {product.deliveryText} to {deliveryLocation}
                  </p>
                  <p
                    className={`font-label text-label-sm tabular-nums mt-0.5 ${
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
      )}
    </div>
  );
}
