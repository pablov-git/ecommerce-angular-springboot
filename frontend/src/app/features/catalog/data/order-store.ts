import { Injectable, signal } from '@angular/core';

import { OrderResponse } from './order-api';

@Injectable({
  providedIn: 'root',
})
export class OrderStore {
  readonly orderSummary = signal<OrderResponse | null>(null);

  setOrderSummary(orderResponse: OrderResponse): void {
    this.orderSummary.set(orderResponse);
  }

  clear(): void {
    this.orderSummary.set(null);
  }
}
