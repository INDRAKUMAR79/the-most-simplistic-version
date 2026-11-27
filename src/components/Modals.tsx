import { useState } from 'react';
import {
  PRODUCTS,
  SINGAPORE_LOCATIONS,
  SUB_NAV_ITEMS,
} from '../data/catalog';
import type { CategoryId, Order, Product } from '../types';
import { ProductImage } from './ProductImage';

interface MenuDrawerProps {
  isOpen: boolean;
  userName: string | null;
  onClose: () => void;
  onSelectCategory: (category: CategoryId | null) => void;
  onOpenAuth: () => void;
  onOpenOrders: () => void;
}

export function MenuDrawer({
  isOpen,
  userName,
  onClose,
  onSelectCategory,
  onOpenAuth,
  onOpenOrders,
}: MenuDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-primary/60 flex"
      role="dialog"
      aria-modal="true"
      aria-label="Shop by Department"
      onClick={onClose}
    >
      <div
        className="w-80 max-w-[85vw] h-full bg-surface-card text-on-surface-card flex flex-col shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenAuth();
          }}
          className="bg-primary-container text-on-primary-container px-gutter-lg py-gutter-md flex items-center gap-3 text-left cursor-pointer"
        >
          <span
            className="material-symbols-outlined text-headline-md"
            aria-hidden="true"
          >
            account_circle
          </span>
          <span className="font-headline text-title-md">
            {userName ? `Hello, ${userName}` : 'Hello, sign in'}
          </span>
        </button>

        <div className="flex-1 overflow-y-auto divide-y divide-outline">
          <div className="py-3">
            <h3 className="px-gutter-lg py-1 font-headline text-title-md text-on-surface-card">
              Shop by Department
            </h3>
            {SUB_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectCategory(item.id);
                  onClose();
                }}
                className="w-full text-left px-gutter-lg py-2.5 font-body text-body-md hover:bg-surface-subtle flex items-center justify-between cursor-pointer"
              >
                <span>{item.label}</span>
                <span
                  className="material-symbols-outlined text-body-md text-on-surface-muted"
                  aria-hidden="true"
                >
                  chevron_right
                </span>
              </button>
            ))}
          </div>

          <div className="py-3">
            <h3 className="px-gutter-lg py-1 font-headline text-title-md text-on-surface-card">
              Help &amp; Settings
            </h3>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full text-left px-gutter-lg py-2.5 font-body text-body-md hover:bg-surface-subtle cursor-pointer"
            >
              Your Account
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenOrders();
              }}
              className="w-full text-left px-gutter-lg py-2.5 font-body text-body-md hover:bg-surface-subtle cursor-pointer"
            >
              Your Orders
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close navigation menu"
        className="p-4 text-on-primary self-start cursor-pointer"
      >
        <span className="material-symbols-outlined text-headline-lg">close</span>
      </button>
    </div>
  );
}

interface LocationModalProps {
  isOpen: boolean;
  currentLocation: string;
  onClose: () => void;
  onSelectLocation: (location: string) => void;
}

export function LocationModal({
  isOpen,
  currentLocation,
  onClose,
  onSelectLocation,
}: LocationModalProps) {
  const [postalInput, setPostalInput] = useState('');
  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = postalInput.trim();
    if (!trimmed) return;
    onSelectLocation(
      trimmed.toLowerCase().startsWith('singapore')
        ? trimmed
        : `Singapore ${trimmed}`,
    );
    setPostalInput('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-primary/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Choose your Singapore delivery location"
      onClick={onClose}
    >
      <div
        className="bg-surface-card text-on-surface-card max-w-md w-full rounded-sm shadow-xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-surface-subtle border-b border-outline px-gutter-lg py-gutter-md flex items-center justify-between">
          <h2 className="font-headline text-title-md">Choose your location</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close location modal"
            className="w-8 h-8 rounded-sm hover:bg-outline/40 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-gutter-lg flex flex-col gap-gutter-md">
          <p className="font-body text-body-sm text-on-surface-muted">
            Delivery options and speeds may vary for different Singapore districts.
          </p>

          <div className="flex flex-col gap-1.5">
            {SINGAPORE_LOCATIONS.map((loc) => (
              <button
                key={loc.label}
                type="button"
                onClick={() => {
                  onSelectLocation(loc.label);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2 rounded-sm border flex items-center justify-between cursor-pointer ${
                  currentLocation === loc.label
                    ? 'border-secondary bg-surface-subtle font-semibold'
                    : 'border-outline hover:border-secondary'
                }`}
              >
                <span className="font-body text-body-sm">{loc.label}</span>
                <span className="font-label text-label-sm text-on-surface-muted">
                  {loc.area}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={postalInput}
              onChange={(event) => setPostalInput(event.target.value)}
              placeholder="Enter Singapore postal code"
              className="flex-1 border border-outline rounded-sm px-3 py-1.5 font-body text-body-sm"
            />
            <button
              type="submit"
              className="bg-tertiary text-on-tertiary hover:bg-accent font-label text-label-sm px-4 py-1.5 rounded-full cursor-pointer"
            >
              Apply
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

interface AuthModalProps {
  isOpen: boolean;
  userName: string | null;
  savedIds: string[];
  onClose: () => void;
  onSignIn: (name: string) => void;
  onSignOut: () => void;
  onOpenProduct: (product: Product) => void;
  onToggleSave: (productId: string) => void;
}

export function AuthModal({
  isOpen,
  userName,
  savedIds,
  onClose,
  onSignIn,
  onSignOut,
  onOpenProduct,
  onToggleSave,
}: AuthModalProps) {
  const [nameInput, setNameInput] = useState('Adriana Chia');
  const [emailInput, setEmailInput] = useState('adrianachia@example.sg');

  if (!isOpen) return null;

  const savedProducts = savedIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  return (
    <div
      className="fixed inset-0 z-50 bg-primary/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Account and Lists"
      onClick={onClose}
    >
      <div
        className="bg-surface-card text-on-surface-card max-w-lg w-full rounded-sm shadow-xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-surface-subtle border-b border-outline px-gutter-lg py-gutter-md flex items-center justify-between">
          <h2 className="font-headline text-title-md">
            {userName ? `Account & Lists — ${userName}` : 'Sign in to Amazon.sg'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close account dialog"
            className="w-8 h-8 rounded-sm hover:bg-outline/40 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-gutter-lg overflow-y-auto flex flex-col gap-gutter-lg">
          {userName ? (
            <div className="flex items-center justify-between bg-surface-subtle border border-outline rounded-sm p-gutter-md">
              <div>
                <p className="font-headline text-title-md">{userName}</p>
                <p className="font-body text-body-sm text-on-surface-muted">
                  Amazon.sg Shopper
                </p>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="border border-outline bg-surface-card hover:bg-outline/30 px-3 py-1.5 rounded-sm font-label text-label-sm cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSignIn(nameInput.trim() || 'Shopper');
              }}
              className="flex flex-col gap-gutter-md"
            >
              <div className="flex flex-col gap-1">
                <label className="font-label text-label-sm">Full name</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  className="border border-outline rounded-sm px-3 py-2 font-body text-body-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label text-label-sm">Email</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  className="border border-outline rounded-sm px-3 py-2 font-body text-body-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-tertiary text-on-tertiary hover:bg-accent font-label text-label-lg py-2 rounded-full cursor-pointer"
              >
                Sign in
              </button>
            </form>
          )}

          <div>
            <h3 className="font-headline text-title-md mb-2">
              Saved List ({savedProducts.length})
            </h3>
            {savedProducts.length === 0 ? (
              <p className="font-body text-body-sm text-on-surface-muted">
                Items you save to your list will appear here.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {savedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-outline rounded-sm p-2.5 flex items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-surface-subtle rounded-sm p-1 shrink-0">
                      <ProductImage
                        src={product.image}
                        alt={product.imageAlt}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenProduct(product);
                        onClose();
                      }}
                      className="flex-1 text-left font-body text-body-sm font-medium hover:text-secondary line-clamp-1 cursor-pointer"
                    >
                      {product.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleSave(product.id)}
                      className="font-label text-label-sm text-secondary hover:underline shrink-0 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface OrdersModalProps {
  isOpen: boolean;
  orders: Order[];
  onClose: () => void;
  onReorder: (productId: string) => void;
}

export function OrdersModal({
  isOpen,
  orders,
  onClose,
  onReorder,
}: OrdersModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-primary/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Returns and Orders"
      onClick={onClose}
    >
      <div
        className="bg-surface-card text-on-surface-card max-w-2xl w-full rounded-sm shadow-xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-surface-subtle border-b border-outline px-gutter-lg py-gutter-md flex items-center justify-between">
          <h2 className="font-headline text-title-md">
            Your Orders &amp; Returns
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close orders dialog"
            className="w-8 h-8 rounded-sm hover:bg-outline/40 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-gutter-lg overflow-y-auto flex flex-col gap-gutter-md">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-outline rounded-sm overflow-hidden"
            >
              <div className="bg-surface-subtle px-gutter-md py-gutter-sm border-b border-outline flex flex-wrap justify-between gap-2 text-label-sm text-on-surface-muted">
                <div>
                  <span className="block font-label">ORDER PLACED</span>
                  <span className="text-on-surface-card font-medium">
                    {order.date}
                  </span>
                </div>
                <div>
                  <span className="block font-label">TOTAL</span>
                  <span className="text-on-surface-card font-medium tabular-nums">
                    S$
                    {order.total.toLocaleString('en-SG', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div>
                  <span className="block font-label">ORDER #</span>
                  <span className="font-mono text-on-surface-card">
                    {order.id}
                  </span>
                </div>
              </div>
              <div className="p-gutter-md flex flex-col gap-3">
                <div>
                  <p className="font-label text-label-sm text-success">
                    {order.status} &middot; {order.address}
                  </p>
                  {order.preferredDate && order.preferredTime && (
                    <p className="font-body text-label-sm text-on-surface-muted mt-0.5">
                      Preferred Delivery: {order.preferredDate} &middot;{' '}
                      {order.preferredTime}
                    </p>
                  )}
                </div>
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 bg-surface-subtle rounded-sm p-1 shrink-0">
                        <ProductImage
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-body text-body-sm font-medium line-clamp-1">
                          {item.title}
                        </p>
                        <p className="font-label text-label-sm text-on-surface-muted tabular-nums">
                          Qty: {item.quantity} &middot; S${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onReorder(item.productId);
                        onClose();
                      }}
                      className="bg-tertiary text-on-tertiary hover:bg-accent font-label text-label-sm px-3 py-1 rounded-full shrink-0 cursor-pointer"
                    >
                      Buy again
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PrimeModalProps {
  isOpen: boolean;
  isPrimeMember: boolean;
  onClose: () => void;
  onTogglePrime: () => void;
}

export function PrimeModal({
  isOpen,
  isPrimeMember,
  onClose,
  onTogglePrime,
}: PrimeModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-primary/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Amazon Prime Singapore"
      onClick={onClose}
    >
      <div
        className="bg-surface-card text-on-surface-card max-w-md w-full rounded-sm shadow-xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-primary text-on-primary px-gutter-lg py-gutter-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-headline text-title-md text-prime-blue">
              prime
            </span>
            <span className="font-label text-label-sm text-outline">
              Singapore
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Prime modal"
            className="w-8 h-8 rounded-sm hover:bg-primary-container flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-gutter-lg flex flex-col gap-gutter-md">
          <h2 className="font-headline text-headline-md">
            {isPrimeMember
              ? 'Your Prime Membership is Active'
              : 'Try Prime Free for 30 Days'}
          </h2>
          <ul className="flex flex-col gap-2 font-body text-body-sm text-on-surface-card">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-title-md text-prime-blue shrink-0">
                local_shipping
              </span>
              <span>
                Free 1-day delivery on eligible local items with no minimum
                spend.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-title-md text-prime-blue shrink-0">
                shopping_bag
              </span>
              <span>
                2-hour scheduled Amazon Fresh grocery delivery across Singapore.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-title-md text-prime-blue shrink-0">
                movie
              </span>
              <span>
                Unlimited streaming of Prime Video originals and exclusive member
                deals.
              </span>
            </li>
          </ul>
          <button
            type="button"
            onClick={() => {
              onTogglePrime();
              onClose();
            }}
            className="w-full bg-tertiary text-on-tertiary hover:bg-accent font-label text-label-lg py-2.5 rounded-full cursor-pointer"
          >
            {isPrimeMember ? 'Cancel Prime Membership' : 'Start 30-day free trial'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface InfoModalProps {
  title: string | null;
  body: string;
  onClose: () => void;
}

export function InfoModal({ title, body, onClose }: InfoModalProps) {
  if (!title) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-primary/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="bg-surface-card text-on-surface-card max-w-md w-full rounded-sm shadow-xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-surface-subtle border-b border-outline px-gutter-lg py-gutter-md flex items-center justify-between">
          <h2 className="font-headline text-title-md">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close info dialog"
            className="w-8 h-8 rounded-sm hover:bg-outline/40 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-gutter-lg flex flex-col gap-gutter-md">
          <p className="font-body text-body-md text-on-surface-card">{body}</p>
          <button
            type="button"
            onClick={onClose}
            className="self-end bg-tertiary text-on-tertiary hover:bg-accent font-label text-label-sm px-5 py-2 rounded-full cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
