import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Category } from '../models/category';
import { Product } from '../models/product';
import { DemoStore } from './demo-store';

@Injectable({
  providedIn: 'root',
})
export class CatalogApi {
  private readonly http = inject(HttpClient);
  private readonly demoStore = inject(DemoStore);

  getProducts(): Observable<Product[]> {
    if (environment.demoMode) {
      return of(this.demoStore.getProducts()).pipe(
        delay(200),
      );
    }

    return this.http.get<Product[]>(
      `${environment.apiBaseUrl}/products`,
    );
  }

  getCategories(): Observable<Category[]> {
    if (environment.demoMode) {
      return of(this.demoStore.getCategories()).pipe(
        delay(120),
      );
    }

    return this.http.get<Category[]>(
      `${environment.apiBaseUrl}/categories`,
    );
  }
}
