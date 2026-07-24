import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  defer,
  delay,
  Observable,
  of,
} from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  CreateOrderRequest,
  OrderResponse,
} from '../models/order';
import { DemoStore } from './demo-store';

@Injectable({
  providedIn: 'root',
})
export class OrderApi {
  private readonly http = inject(HttpClient);
  private readonly demoStore = inject(DemoStore);

  createOrder(
    request: CreateOrderRequest,
  ): Observable<OrderResponse> {
    if (environment.demoMode) {
      return defer(() =>
        of(this.demoStore.createOrder(request)),
      ).pipe(delay(450));
    }

    return this.http.post<OrderResponse>(
      `${environment.apiBaseUrl}/orders`,
      request,
    );
  }
}
