import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { CatalogApi } from '../data/catalog-api';
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
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  constructor() {
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
