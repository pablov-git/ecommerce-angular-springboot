import { CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';

import { CatalogApi } from '../data/catalog-api';
import { Category } from '../models/category';
import { Product } from '../models/product';

type SortOption = 'name-asc' | 'price-asc' | 'price-desc';
type CatalogView = 'catalog' | 'checkout' | 'order-confirmation';

interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './product-catalog.html',
  styleUrl: './product-catalog.scss',
})
export class ProductCatalog {
  private readonly catalogApi = inject(CatalogApi);
  private readonly cartStorageKey = 'ecommerce-cart';

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly cartItems = signal<CartItem[]>([]);

  readonly currentView = signal<CatalogView>('catalog');
  readonly selectedCategorySlug = signal<string>('all');
  readonly searchTerm = signal('');
  readonly sortOption = signal<SortOption>('name-asc');
  readonly isCartOpen = signal(false);
  readonly addedProduct = signal<Product | null>(null);

  readonly checkoutName = signal('');
  readonly checkoutEmail = signal('');
  readonly checkoutAddress = signal('');
  readonly placedOrderNumber = signal('');

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  readonly filteredProducts = computed(() => {
    const selectedCategorySlug = this.selectedCategorySlug();
    const searchTerm = this.searchTerm().trim().toLowerCase();
    const sortOption = this.sortOption();

    const filtered = this.products().filter((product) => {
      const matchesCategory =
        selectedCategorySlug === 'all' ||
        product.categorySlug === selectedCategorySlug;

      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm) ||
        product.categoryName.toLowerCase().includes(searchTerm);

      return matchesCategory && matchesSearch;
    });

    return [...filtered].sort((firstProduct, secondProduct) => {
      if (sortOption === 'price-asc') {
        return firstProduct.price - secondProduct.price;
      }

      if (sortOption === 'price-desc') {
        return secondProduct.price - firstProduct.price;
      }

      return firstProduct.name.localeCompare(secondProduct.name);
    });
  });

  readonly cartCount = computed(() =>
    this.cartItems().reduce((total, item) => total + item.quantity, 0)
  );

  readonly cartSubtotal = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    )
  );

  readonly isCheckoutValid = computed(() => {
    const name = this.checkoutName().trim();
    const email = this.checkoutEmail().trim();
    const address = this.checkoutAddress().trim();

    return (
      this.cartItems().length > 0 &&
      name.length >= 2 &&
      this.isValidEmail(email) &&
      address.length >= 5
    );
  });

  constructor() {
    this.loadCartFromStorage();
    this.loadCatalog();

    effect(() => {
      this.saveCartToStorage(this.cartItems());
    });
  }

  selectCategory(categorySlug: string): void {
    this.selectedCategorySlug.set(categorySlug);
  }

  openCart(): void {
    this.closeAddedProductConfirmation();
    this.isCartOpen.set(true);
  }

  closeCart(): void {
    this.isCartOpen.set(false);
  }

  goToCheckout(): void {
    if (this.cartItems().length === 0) {
      return;
    }

    this.closeAddedProductConfirmation();
    this.isCartOpen.set(false);
    this.currentView.set('checkout');
  }

  backToCatalog(): void {
    this.currentView.set('catalog');
  }

  addToCart(product: Product, showConfirmation = true): void {
    if (product.stock <= 0) {
      return;
    }

    this.cartItems.update((items) => {
      const existingItem = items.find((item) => item.product.id === product.id);

      if (!existingItem) {
        return [...items, { product, quantity: 1 }];
      }

      return items.map((item) => {
        if (item.product.id !== product.id) {
          return item;
        }

        return {
          ...item,
          quantity: Math.min(item.quantity + 1, product.stock),
        };
      });
    });

    if (showConfirmation) {
      this.showAddedProductConfirmation(product);
    }
  }

  decreaseCartItem(productId: string): void {
    this.cartItems.update((items) =>
      items
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  removeCartItem(productId: string): void {
    this.cartItems.update((items) =>
      items.filter((item) => item.product.id !== productId)
    );
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.currentView.set('catalog');
    this.isCartOpen.set(false);
    this.closeAddedProductConfirmation();
  }

  closeAddedProductConfirmation(): void {
    this.addedProduct.set(null);
  }

  viewCartFromConfirmation(): void {
    this.closeAddedProductConfirmation();
    this.openCart();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.sortOption.set(select.value as SortOption);
  }

  onCheckoutNameChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.checkoutName.set(input.value);
  }

  onCheckoutEmailChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.checkoutEmail.set(input.value);
  }

  onCheckoutAddressChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.checkoutAddress.set(input.value);
  }

  placeOrder(event: Event): void {
    event.preventDefault();

    if (!this.isCheckoutValid()) {
      return;
    }

    this.placedOrderNumber.set(this.createOrderNumber());
    this.cartItems.set([]);
    this.currentView.set('order-confirmation');
  }

  startNewOrder(): void {
    this.checkoutName.set('');
    this.checkoutEmail.set('');
    this.checkoutAddress.set('');
    this.placedOrderNumber.set('');
    this.currentView.set('catalog');
  }

  private showAddedProductConfirmation(product: Product): void {
    this.addedProduct.set(product);
  }

  private loadCatalog(): void {
    this.catalogApi.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: () => {
        this.errorMessage.set('Could not load categories.');
      },
    });

    this.catalogApi.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.syncCartWithProducts(products);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load products.');
        this.isLoading.set(false);
      },
    });
  }

  private loadCartFromStorage(): void {
    try {
      const storedCart = localStorage.getItem(this.cartStorageKey);

      if (!storedCart) {
        return;
      }

      const parsedCart = JSON.parse(storedCart) as CartItem[];

      if (!Array.isArray(parsedCart)) {
        return;
      }

      this.cartItems.set(
        parsedCart.filter(
          (item) =>
            item.product &&
            typeof item.product.id === 'string' &&
            typeof item.quantity === 'number' &&
            item.quantity > 0
        )
      );
    } catch {
      localStorage.removeItem(this.cartStorageKey);
    }
  }

  private saveCartToStorage(cartItems: CartItem[]): void {
    try {
      localStorage.setItem(this.cartStorageKey, JSON.stringify(cartItems));
    } catch {
      // Storage can fail in private browsing or restricted environments.
    }
  }

  private syncCartWithProducts(products: Product[]): void {
    const productsById = new Map(
      products.map((product) => [product.id, product])
    );

    this.cartItems.update((items) =>
      items
        .map((item) => {
          const currentProduct = productsById.get(item.product.id);

          if (!currentProduct || currentProduct.stock <= 0) {
            return null;
          }

          return {
            product: currentProduct,
            quantity: Math.min(item.quantity, currentProduct.stock),
          };
        })
        .filter((item): item is CartItem => item !== null)
    );
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private createOrderNumber(): string {
    return `ORD-${Date.now().toString().slice(-8)}`;
  }
}
