import { Component, computed, inject, signal } from '@angular/core';

import { AddToCartConfirmation } from '../add-to-cart-confirmation/add-to-cart-confirmation';
import { CartDrawer } from '../cart-drawer/cart-drawer';
import { Checkout, CheckoutFormValue } from '../checkout/checkout';
import { CatalogApi } from '../data/catalog-api';
import { CartStore } from '../data/cart-store';
import { ProductCard } from '../product-card/product-card';
import { Category } from '../models/category';
import { Product } from '../models/product';

type SortOption = 'name-asc' | 'price-asc' | 'price-desc';
type CatalogView = 'catalog' | 'checkout' | 'order-confirmation';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [Checkout, CartDrawer, AddToCartConfirmation, ProductCard],
  templateUrl: './product-catalog.html',
  styleUrl: './product-catalog.scss',
})
export class ProductCatalog {
  private readonly catalogApi = inject(CatalogApi);
  private readonly cartStore = inject(CartStore);

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);

  readonly cartItems = this.cartStore.cartItems;
  readonly cartCount = this.cartStore.cartCount;
  readonly cartSubtotal = this.cartStore.cartSubtotal;

  readonly currentView = signal<CatalogView>('catalog');
  readonly selectedCategorySlug = signal<string>('all');
  readonly searchTerm = signal('');
  readonly sortOption = signal<SortOption>('name-asc');
  readonly isCartOpen = signal(false);
  readonly addedProduct = signal<Product | null>(null);

  readonly placedOrderNumber = signal('');
  readonly placedOrderEmail = signal('');

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

  constructor() {
    this.loadCatalog();
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
    const wasAdded = this.cartStore.add(product);

    if (wasAdded && showConfirmation) {
      this.showAddedProductConfirmation(product);
    }
  }

  decreaseCartItem(productId: string): void {
    this.cartStore.decrease(productId);
  }

  removeCartItem(productId: string): void {
    this.cartStore.remove(productId);
  }

  clearCart(): void {
    this.cartStore.clear();
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

  placeOrder(formValue: CheckoutFormValue): void {
    this.placedOrderNumber.set(this.createOrderNumber());
    this.placedOrderEmail.set(formValue.email);
    this.cartStore.clear();
    this.currentView.set('order-confirmation');
  }

  startNewOrder(): void {
    this.placedOrderNumber.set('');
    this.placedOrderEmail.set('');
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
        this.cartStore.syncWithProducts(products);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load products.');
        this.isLoading.set(false);
      },
    });
  }

  private createOrderNumber(): string {
    return `ORD-${Date.now().toString().slice(-8)}`;
  }
}
