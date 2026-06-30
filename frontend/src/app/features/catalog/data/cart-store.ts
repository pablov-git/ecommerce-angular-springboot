import { computed, effect, Injectable, signal } from '@angular/core';

import { Product } from '../models/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartStore {
  private readonly storageKey = 'ecommerce-cart';

  readonly cartItems = signal<CartItem[]>([]);

  readonly cartCount = computed(() =>
    this.cartItems().reduce((total, item) => total + item.quantity, 0)
  );

  readonly cartSubtotal = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    )
  );

  constructor() {
    this.loadFromStorage();

    effect(() => {
      this.saveToStorage(this.cartItems());
    });
  }

  add(product: Product): boolean {
    if (product.stock <= 0) {
      return false;
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

    return true;
  }

  decrease(productId: string): void {
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

  remove(productId: string): void {
    this.cartItems.update((items) =>
      items.filter((item) => item.product.id !== productId)
    );
  }

  clear(): void {
    this.cartItems.set([]);
  }

  syncWithProducts(products: Product[]): void {
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

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const storedCart = localStorage.getItem(this.storageKey);

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
      localStorage.removeItem(this.storageKey);
    }
  }

  private saveToStorage(cartItems: CartItem[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(cartItems));
    } catch {
      // Storage can fail in private browsing or restricted environments.
    }
  }
}
