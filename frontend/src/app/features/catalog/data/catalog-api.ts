import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Category } from '../models/category';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root',
})
export class CatalogApi {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:8081/api';

  getProducts() {
    return this.http.get<Product[]>(`${this.apiBaseUrl}/products`);
  }

  getCategories() {
    return this.http.get<Category[]>(`${this.apiBaseUrl}/categories`);
  }
}
