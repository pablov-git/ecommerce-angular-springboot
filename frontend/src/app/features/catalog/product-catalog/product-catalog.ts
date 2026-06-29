import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { CatalogApi } from '../data/catalog-api';
import { Category } from '../models/category';
import { Product } from '../models/product';

type SortOption = 'name-asc' | 'price-asc' | 'price-desc';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './product-catalog.html',
  styleUrl: './product-catalog.scss',
})
export class ProductCatalog {
  private readonly catalogApi = inject(CatalogApi);

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);

  readonly selectedCategorySlug = signal<string>('all');
  readonly searchTerm = signal('');
  readonly sortOption = signal<SortOption>('name-asc');

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

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.sortOption.set(select.value as SortOption);
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
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load products.');
        this.isLoading.set(false);
      },
    });
  }
}
