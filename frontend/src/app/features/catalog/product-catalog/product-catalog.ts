import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { CatalogApi } from '../data/catalog-api';
import { Category } from '../models/category';
import { Product } from '../models/product';

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

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  readonly filteredProducts = computed(() => {
    const selectedCategorySlug = this.selectedCategorySlug();

    if (selectedCategorySlug === 'all') {
      return this.products();
    }

    return this.products().filter(
      (product) => product.categorySlug === selectedCategorySlug
    );
  });

  constructor() {
    this.loadCatalog();
  }

  selectCategory(categorySlug: string): void {
    this.selectedCategorySlug.set(categorySlug);
  }

  private loadCatalog(): void {
    this.catalogApi.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: () => {
        this.errorMessage.set('Could not load categories from backend.');
      },
    });

    this.catalogApi.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load products from backend.');
        this.isLoading.set(false);
      },
    });
  }
}
