/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { INITIAL_ORDERS, PRODUCTS } from './data/catalog';
import type {
  CartItem,
  CategoryId,
  MoodRecommendation,
  Order,
  Product,
} from './types';
import { Header } from './components/Header';
import { MoodBar } from './components/MoodBar';
import { MoodRecommendations } from './components/MoodRecommendations';
import { CatalogView } from './components/CatalogView';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import {
  AuthModal,
  InfoModal,
  LocationModal,
  MenuDrawer,
  OrdersModal,
  PrimeModal,
} from './components/Modals';

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [cart, setCart] = useState<CartItem[]>(() =>
    readStorage('amazonsg_cart', []),
  );
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    readStorage('amazonsg_saved', []),
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    readStorage('amazonsg_orders', INITIAL_ORDERS),
  );
  const [userName, setUserName] = useState<string | null>(() =>
    readStorage('amazonsg_user', null),
  );
  const [deliveryLocation, setDeliveryLocation] = useState<string>(() =>
    readStorage('amazonsg_location', 'Singapore'),
  );
  const [isPrimeMember, setIsPrimeMember] = useState<boolean>(() =>
    readStorage('amazonsg_prime', false),
  );
  const [language, setLanguage] = useState('EN');
  const [activeNavCategory, setActiveNavCategory] = useState<CategoryId | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<CategoryId>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isPrimeOpen, setIsPrimeOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<{
    title: string | null;
    body: string;
  }>({ title: null, body: '' });

  const [moodInput, setMoodInput] = useState('');
  const [moodLoading, setMoodLoading] = useState(false);
  const [moodError, setMoodError] = useState<string | null>(null);
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const [moodSummary, setMoodSummary] = useState<string | null>(null);
  const [moodResults, setMoodResults] = useState<MoodRecommendation[]>([]);

  useEffect(() => {
    try {
      window.localStorage.setItem('amazonsg_cart', JSON.stringify(cart));
      window.localStorage.setItem('amazonsg_saved', JSON.stringify(savedIds));
      window.localStorage.setItem('amazonsg_orders', JSON.stringify(orders));
      window.localStorage.setItem('amazonsg_user', JSON.stringify(userName));
      window.localStorage.setItem(
        'amazonsg_location',
        JSON.stringify(deliveryLocation),
      );
      window.localStorage.setItem(
        'amazonsg_prime',
        JSON.stringify(isPrimeMember),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [cart, savedIds, orders, userName, deliveryLocation, isPrimeMember]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedProduct(null);
        setIsCartOpen(false);
        setIsMenuOpen(false);
        setIsLocationOpen(false);
        setIsAuthOpen(false);
        setIsOrdersOpen(false);
        setIsPrimeOpen(false);
        setInfoModal({ title: null, body: '' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        const nextQty = Math.min(product.stockLeft, existing.quantity + quantity);
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: nextQty } : item,
        );
      }
      return [
        ...prev,
        { productId: product.id, quantity: Math.min(product.stockLeft, quantity) },
      ];
    });
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsCartOpen(true);
    }
  };

  const buyNow = (product: Product, quantity = 1) => {
    addToCart(product, quantity);
    setIsCartOpen(true);
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }
    const product = PRODUCTS.find((p) => p.id === productId);
    const maxQty = product ? product.stockLeft : quantity;
    const clamped = Math.min(maxQty, quantity);
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: clamped } : item,
      ),
    );
  };

  const removeCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const placeOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCart([]);
  };

  const toggleSave = (productId: string) => {
    setSavedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleReorder = (productId: string) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (product) {
      addToCart(product, 1);
      setIsCartOpen(true);
    }
  };

  const handleSelectCategory = (category: CategoryId | null) => {
    if (category === null) {
      setActiveNavCategory(null);
      setSearchQuery('');
    } else {
      setSearchQuery('');
      setActiveNavCategory(category);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitSearch = (query: string, category: CategoryId) => {
    setSearchCategory(category);
    setSearchQuery(query);
    setActiveNavCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitMood = async (rawMood: string) => {
    const trimmed = rawMood.trim();
    if (!trimmed) {
      setMoodError('Tell us how you are feeling today to see tailored recommendations.');
      return;
    }

    setMoodLoading(true);
    setMoodError(null);

    try {
      const response = await fetch('/api/mood-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: trimmed }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not load mood recommendations.');
      }

      const matched = ((data.recommendations ?? []) as Array<{
        productId: string;
        reason: string;
      }>)
        .map((rec) => {
          const product = PRODUCTS.find((p) => p.id === rec.productId);
          return product ? { product, reason: rec.reason } : null;
        })
        .filter((item): item is MoodRecommendation => Boolean(item));

      setAffirmation(data.affirmation ?? null);
      setMoodSummary(data.summary ?? null);
      setMoodResults(matched);
    } catch (error) {
      setMoodError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setMoodLoading(false);
    }
  };

  const handleClearMood = () => {
    setMoodInput('');
    setAffirmation(null);
    setMoodSummary(null);
    setMoodResults([]);
    setMoodError(null);
  };

  const showCatalogView = activeNavCategory !== null || searchQuery.length > 0;
  const selectedCartQty = selectedProduct
    ? cart.find((item) => item.productId === selectedProduct.id)?.quantity ?? 0
    : 0;

  return (
    <div
      className={`min-h-screen flex flex-col bg-surface text-on-surface transition-all duration-200 ${
        isCartOpen ? 'lg:pr-[420px]' : ''
      }`}
    >
      <Header
        deliveryLocation={deliveryLocation}
        searchQuery={searchQuery}
        searchCategory={searchCategory}
        activeNavCategory={activeNavCategory}
        cartCount={cartCount}
        userName={userName}
        language={language}
        onChangeLanguage={setLanguage}
        onSubmitSearch={handleSubmitSearch}
        onSelectCategory={handleSelectCategory}
        onOpenProduct={setSelectedProduct}
        onOpenMenuDrawer={() => setIsMenuOpen(true)}
        onOpenLocationModal={() => setIsLocationOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenOrdersModal={() => setIsOrdersOpen(true)}
        onOpenCartDrawer={() => setIsCartOpen(true)}
        onOpenPrimeModal={() => setIsPrimeOpen(true)}
      />

      <main
        id="top"
        className="flex-1 max-w-[1500px] w-full mx-auto pb-gutter-xl"
      >
        {showCatalogView ? (
          <CatalogView
            searchQuery={searchQuery}
            activeCategory={activeNavCategory ?? 'all'}
            deliveryLocation={deliveryLocation}
            onSelectCategory={handleSelectCategory}
            onClearSearch={() => setSearchQuery('')}
            onAddToCart={(product) => addToCart(product, 1)}
            onOpenProduct={setSelectedProduct}
          />
        ) : (
          <div className="px-page-margin py-10 md:py-14 flex flex-col items-center gap-gutter-lg">
            <div className="w-full max-w-[460px]">
              <MoodBar
                moodInput={moodInput}
                loading={moodLoading}
                errorMsg={moodError}
                affirmation={affirmation}
                hasResults={moodResults.length > 0}
                onChangeMood={setMoodInput}
                onSubmitMood={(mood) => void handleSubmitMood(mood)}
                onClear={handleClearMood}
              />
            </div>

            <MoodRecommendations
              loading={moodLoading}
              affirmation={affirmation}
              summary={moodSummary}
              results={moodResults}
              onAddToCart={(product) => addToCart(product, 1)}
              onOpenProduct={setSelectedProduct}
              onClear={handleClearMood}
            />
          </div>
        )}
      </main>

      <Footer
        onOpenInfo={(title, body) => setInfoModal({ title, body })}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenLocation={() => setIsLocationOpen(true)}
      />

      <ProductModal
        key={selectedProduct?.id ?? 'none'}
        product={selectedProduct}
        deliveryLocation={deliveryLocation}
        isSaved={selectedProduct ? savedIds.includes(selectedProduct.id) : false}
        cartQuantity={selectedCartQty}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
        onBuyNow={buyNow}
        onToggleSave={toggleSave}
      />

      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        deliveryLocation={deliveryLocation}
        isPrimeMember={isPrimeMember}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={updateCartQty}
        onRemoveItem={removeCartItem}
        onPlaceOrder={placeOrder}
        onOpenProduct={setSelectedProduct}
      />

      <MenuDrawer
        isOpen={isMenuOpen}
        userName={userName}
        onClose={() => setIsMenuOpen(false)}
        onSelectCategory={handleSelectCategory}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
      />

      <LocationModal
        isOpen={isLocationOpen}
        currentLocation={deliveryLocation}
        onClose={() => setIsLocationOpen(false)}
        onSelectLocation={setDeliveryLocation}
      />

      <AuthModal
        isOpen={isAuthOpen}
        userName={userName}
        savedIds={savedIds}
        onClose={() => setIsAuthOpen(false)}
        onSignIn={setUserName}
        onSignOut={() => setUserName(null)}
        onOpenProduct={setSelectedProduct}
        onToggleSave={toggleSave}
      />

      <OrdersModal
        isOpen={isOrdersOpen}
        orders={orders}
        onClose={() => setIsOrdersOpen(false)}
        onReorder={handleReorder}
      />

      <PrimeModal
        isOpen={isPrimeOpen}
        isPrimeMember={isPrimeMember}
        onClose={() => setIsPrimeOpen(false)}
        onTogglePrime={() => setIsPrimeMember((prev) => !prev)}
      />

      <InfoModal
        title={infoModal.title}
        body={infoModal.body}
        onClose={() => setInfoModal({ title: null, body: '' })}
      />
    </div>
  );
}
