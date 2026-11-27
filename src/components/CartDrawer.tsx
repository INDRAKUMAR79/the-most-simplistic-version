import { useState } from 'react';
import { PRODUCTS } from '../data/catalog';
import type { CartItem, Order, Product } from '../types';
import { ProductImage } from './ProductImage';

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  deliveryLocation: string;
  isPrimeMember: boolean;
  onClose: () => void;
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onPlaceOrder: (order: Order) => void;
  onOpenProduct: (product: Product) => void;
}

const DELIVERY_TIME_SLOTS = [
  '09:00 AM – 12:00 PM',
  '12:00 PM – 03:00 PM',
  '03:00 PM – 06:00 PM',
  '06:00 PM – 09:00 PM',
];

function getLocalDateString(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatReadableDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-SG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function CartDrawer({
  isOpen,
  cart,
  deliveryLocation,
  isPrimeMember,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onPlaceOrder,
  onOpenProduct,
}: CartDrawerProps) {
  const [step, setStep] = useState<'cart' | 'checkout' | 'done'>('cart');
  const [recipient, setRecipient] = useState('Adriana Chia');
  const [address, setAddress] = useState(
    deliveryLocation.replace('Singapore ', ''),
  );
  const [preferredDate, setPreferredDate] = useState(() =>
    getLocalDateString(1),
  );
  const [preferredTime, setPreferredTime] = useState(DELIVERY_TIME_SLOTS[0]);
  const [lastOrder, setLastOrder] = useState<{
    id: string;
    preferredDate: string;
    preferredTime: string;
  } | null>(null);

  if (!isOpen) return null;

  const minDate = getLocalDateString(0);

  const lineItems = cart
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      return product ? { product, quantity: item.quantity } : null;
    })
    .filter((entry): entry is { product: Product; quantity: number } =>
      Boolean(entry),
    );

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const totalCount = lineItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = isPrimeMember || subtotal >= 40 || subtotal === 0 ? 0 : 4.99;
  const grandTotal = subtotal + shippingFee;

  const handleCheckoutSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const orderId = `SG-${Math.floor(100 + Math.random() * 899)}-${Math.floor(
      1000000 + Math.random() * 8999999,
    )}`;
    const formattedDate = formatReadableDate(preferredDate);

    onPlaceOrder({
      id: orderId,
      date: new Date().toLocaleDateString('en-SG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      status: 'Confirmed — Preparing shipment',
      total: grandTotal,
      address: `${recipient.trim() || 'Shopper'}, Singapore ${address.trim() || '238801'}`,
      preferredDate: formattedDate,
      preferredTime,
      items: lineItems.map(({ product, quantity }) => ({
        productId: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
        quantity,
      })),
    });
    setLastOrder({
      id: orderId,
      preferredDate: formattedDate,
      preferredTime,
    });
    setStep('done');
  };

  return (
    <div className="fixed inset-0 z-50 lg:left-auto lg:w-[420px] flex justify-end">
      <div
        className="fixed inset-0 bg-primary/50 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        aria-label="Shopping Cart"
        className="relative z-10 w-full max-w-[420px] h-full bg-surface-card text-on-surface-card border-l border-outline shadow-2xl flex flex-col"
      >
        <div className="bg-primary text-on-primary px-gutter-lg py-gutter-md flex items-center justify-between">
          <h2 className="font-headline text-title-md">
            {step === 'checkout'
              ? 'Checkout'
              : `Shopping Cart (${totalCount})`}
          </h2>
          <button
            type="button"
            onClick={() => {
              setStep('cart');
              onClose();
            }}
            aria-label="Close shopping cart"
            className="w-8 h-8 rounded-sm hover:bg-primary-container flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-gutter-lg flex flex-col gap-gutter-md">
          {step === 'done' && lastOrder ? (
            <div className="bg-surface-subtle border border-outline rounded-sm p-gutter-lg flex flex-col items-center text-center gap-gutter-md">
              <span
                className="material-symbols-outlined text-display-lg text-success"
                aria-hidden="true"
              >
                check_circle
              </span>
              <h3 className="font-headline text-headline-md text-on-surface-card">
                Order Placed
              </h3>
              <p className="font-body text-body-sm text-on-surface-muted">
                Order <span className="font-mono font-semibold">{lastOrder.id}</span>{' '}
                is confirmed for delivery to {deliveryLocation}.
              </p>
              <div className="w-full bg-surface-card border border-outline rounded-sm p-gutter-md text-left flex flex-col gap-1">
                <span className="font-label text-label-sm text-on-surface-muted">
                  Preferred Delivery Date &amp; Time
                </span>
                <span className="font-body text-body-sm font-semibold text-on-surface-card">
                  {lastOrder.preferredDate} &middot; {lastOrder.preferredTime}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('cart');
                  onClose();
                }}
                className="bg-tertiary text-on-tertiary hover:bg-accent font-label text-label-lg px-5 py-2 rounded-full cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : lineItems.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center gap-gutter-sm">
              <span
                className="material-symbols-outlined text-display-lg text-on-surface-muted"
                aria-hidden="true"
              >
                shopping_cart
              </span>
              <h3 className="font-headline text-title-md text-on-surface-card">
                Your Amazon.sg Cart is empty
              </h3>
              <p className="font-body text-body-sm text-on-surface-muted">
                Use the Search Bar or Mood Bar to discover items.
              </p>
            </div>
          ) : step === 'checkout' ? (
            <form
              onSubmit={handleCheckoutSubmit}
              className="flex flex-col gap-gutter-md"
            >
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="self-start font-label text-label-sm text-secondary hover:underline cursor-pointer"
              >
                &larr; Back to cart
              </button>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="checkout-recipient"
                  className="font-label text-label-sm text-on-surface-card"
                >
                  Recipient Name
                </label>
                <input
                  id="checkout-recipient"
                  type="text"
                  required
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  className="border border-outline rounded-sm px-3 py-2 font-body text-body-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="checkout-address"
                  className="font-label text-label-sm text-on-surface-card"
                >
                  Singapore Postal Code / Street
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  required
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="border border-outline rounded-sm px-3 py-2 font-body text-body-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter-sm">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="checkout-preferred-date"
                    className="font-label text-label-sm text-on-surface-card"
                  >
                    Preferred Delivery Date
                  </label>
                  <input
                    id="checkout-preferred-date"
                    type="date"
                    required
                    min={minDate}
                    value={preferredDate}
                    onChange={(event) => setPreferredDate(event.target.value)}
                    className="border border-outline rounded-sm px-3 py-2 font-body text-body-sm bg-surface-card"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="checkout-preferred-time"
                    className="font-label text-label-sm text-on-surface-card"
                  >
                    Preferred Delivery Time
                  </label>
                  <select
                    id="checkout-preferred-time"
                    value={preferredTime}
                    onChange={(event) => setPreferredTime(event.target.value)}
                    className="border border-outline rounded-sm px-3 py-2 font-body text-body-sm bg-surface-card cursor-pointer"
                  >
                    {DELIVERY_TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="bg-surface-subtle border border-outline rounded-sm p-gutter-md flex flex-col gap-1 text-body-sm tabular-nums">
                <div className="flex justify-between">
                  <span>Items ({totalCount}):</span>
                  <span>S${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>
                    {shippingFee === 0 ? 'FREE' : `S$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between gap-2 text-label-sm text-on-surface-muted pt-1">
                  <span className="shrink-0">Preferred Date &amp; Time:</span>
                  <span className="text-right font-medium text-on-surface-card">
                    {formatReadableDate(preferredDate)}, {preferredTime}
                  </span>
                </div>
                <div className="flex justify-between font-headline text-title-md border-t border-outline pt-2 mt-1">
                  <span>Order Total:</span>
                  <span>S${grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-tertiary text-on-tertiary hover:bg-accent font-label text-label-lg py-2.5 rounded-full cursor-pointer"
              >
                Place Order
              </button>
            </form>
          ) : (
            lineItems.map(({ product, quantity }) => {
              const remainingAvailable = Math.max(0, product.stockLeft - quantity);
              const atMaxStock = remainingAvailable <= 0;

              return (
                <div
                  key={product.id}
                  className="border border-outline rounded-sm p-gutter-md flex gap-3"
                >
                  <button
                    type="button"
                    onClick={() => onOpenProduct(product)}
                    className="w-20 h-20 bg-surface-subtle rounded-sm p-2 shrink-0 flex items-center justify-center cursor-pointer"
                  >
                    <ProductImage
                      src={product.image}
                      alt={product.imageAlt}
                      className="w-full h-full object-contain"
                    />
                  </button>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => onOpenProduct(product)}
                      className="text-left font-body text-body-sm font-semibold text-on-surface-card line-clamp-2 hover:text-secondary cursor-pointer"
                    >
                      {product.title}
                    </button>
                    <span className="font-headline text-title-md tabular-nums">
                      S${product.price.toFixed(2)}
                    </span>
                    <span
                      className={`font-label text-label-sm tabular-nums ${
                        atMaxStock || remainingAvailable <= 3
                          ? 'text-deal-red font-medium'
                          : 'text-success'
                      }`}
                    >
                      {atMaxStock
                        ? '0 still available (max in cart)'
                        : `${remainingAvailable} still available`}
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center border border-outline rounded-sm">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => onUpdateQty(product.id, quantity - 1)}
                          className="px-2 py-0.5 hover:bg-surface-subtle cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 font-label text-label-sm tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          disabled={atMaxStock}
                          aria-label="Increase quantity"
                          onClick={() => onUpdateQty(product.id, quantity + 1)}
                          className="px-2 py-0.5 hover:bg-surface-subtle cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(product.id)}
                        className="font-label text-label-sm text-secondary hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {step === 'cart' && lineItems.length > 0 && (
          <div className="border-t border-outline p-gutter-lg bg-surface-subtle flex flex-col gap-gutter-sm">
            <div className="flex items-baseline justify-between tabular-nums">
              <span className="font-body text-body-md">
                Subtotal ({totalCount} {totalCount === 1 ? 'item' : 'items'}):
              </span>
              <span className="font-headline text-headline-sm">
                S$
                {subtotal.toLocaleString('en-SG', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep('checkout')}
              className="w-full bg-tertiary text-on-tertiary hover:bg-accent font-label text-label-lg py-2.5 rounded-full cursor-pointer"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
