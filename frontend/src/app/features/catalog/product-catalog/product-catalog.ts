import {
  Component,
  computed,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

import { AddToCartConfirmation } from '../add-to-cart-confirmation/add-to-cart-confirmation';
import { CartDrawer } from '../cart-drawer/cart-drawer';
import { CatalogApi } from '../data/catalog-api';
import { CartStore } from '../data/cart-store';
import { Category } from '../models/category';
import { Product } from '../models/product';
import { ProductCard } from '../product-card/product-card';

type SortOption = 'name-asc' | 'price-asc' | 'price-desc';

interface SortOptionItem {
  value: SortOption;
  label: string;
}

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [AddToCartConfirmation, CartDrawer, ProductCard],
  templateUrl: './product-catalog.html',
  styleUrl: './product-catalog.scss',
})
export class ProductCatalog {
  private readonly catalogApi = inject(CatalogApi);
  private readonly cartStore = inject(CartStore);
  private readonly router = inject(Router);

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);

  readonly cartItems = this.cartStore.cartItems;
  readonly cartCount = this.cartStore.cartCount;
  readonly cartSubtotal = this.cartStore.cartSubtotal;

  readonly selectedCategorySlug = signal<string>('all');
  readonly searchTerm = signal('');
  readonly sortOption = signal<SortOption>('name-asc');
  readonly isSortMenuOpen = signal(false);

  readonly isCartOpen = signal(false);
  readonly addedProduct = signal<Product | null>(null);

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  readonly sortOptions: ReadonlyArray<SortOptionItem> = [
    {
      value: 'name-asc',
      label: 'Name',
    },
    {
      value: 'price-asc',
      label: 'Price: low to high',
    },
    {
      value: 'price-desc',
      label: 'Price: high to low',
    },
  ];

  readonly selectedSortLabel = computed(() => {
    return (
      this.sortOptions.find(
        (option) => option.value === this.sortOption(),
      )?.label ?? 'Name'
    );
  });

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target;

    if (
      !(target instanceof Element) ||
      !target.closest('.sort-control')
    ) {
      this.closeSortMenu();
    }
  }

  selectCategory(categorySlug: string): void {
    this.selectedCategorySlug.set(categorySlug);
  }

  toggleSortMenu(): void {
    this.isSortMenuOpen.update((isOpen) => !isOpen);
  }

  closeSortMenu(): void {
    this.isSortMenuOpen.set(false);
  }

  selectSortOption(option: SortOption): void {
    this.sortOption.set(option);
    this.closeSortMenu();
  }

  onSortTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.isSortMenuOpen.set(true);
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeSortMenu();
    }
  }

  onSortMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeSortMenu();
    }
  }

  openCart(): void {
    this.closeAddedProductConfirmation();
    this.closeSortMenu();
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

    void this.router.navigate(['/checkout']);
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
}
