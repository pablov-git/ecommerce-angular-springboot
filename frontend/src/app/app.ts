import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly http = inject(HttpClient);

  products = signal<Product[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  constructor() {
    this.http.get<Product[]>('http://localhost:8081/api/products').subscribe({
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
