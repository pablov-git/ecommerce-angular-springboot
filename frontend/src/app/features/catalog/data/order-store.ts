import { Injectable, signal } from '@angular/core';

import { OrderResponse } from '../models/order';

@Injectable({
  providedIn: 'root',
})
export class OrderStore {
  private readonly storageKey =
    'pixeltronics-last-order';

  readonly orderSummary = signal<OrderResponse | null>(
    this.loadOrderSummary(),
  );

  setOrderSummary(orderResponse: OrderResponse): void {
    this.orderSummary.set(orderResponse);
    this.saveOrderSummary(orderResponse);
  }

  clear(): void {
    this.orderSummary.set(null);

    if (typeof sessionStorage === 'undefined') {
      return;
    }

    try {
      sessionStorage.removeItem(this.storageKey);
    } catch {
      // El estado en memoria ya ha sido eliminado.
    }
  }

  private loadOrderSummary(): OrderResponse | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }

    try {
      const storedOrder = sessionStorage.getItem(
        this.storageKey,
      );

      if (!storedOrder) {
        return null;
      }

      const parsedOrder = JSON.parse(
        storedOrder,
      ) as Partial<OrderResponse>;

      if (
        typeof parsedOrder.id !== 'string' ||
        typeof parsedOrder.orderNumber !== 'string' ||
        typeof parsedOrder.totalAmount !== 'number' ||
        !Array.isArray(parsedOrder.items)
      ) {
        sessionStorage.removeItem(this.storageKey);
        return null;
      }

      return parsedOrder as OrderResponse;
    } catch {
      return null;
    }
  }

  private saveOrderSummary(
    orderResponse: OrderResponse,
  ): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    try {
      sessionStorage.setItem(
        this.storageKey,
        JSON.stringify(orderResponse),
      );
    } catch {
      //La página de confirmación seguirá funcionando con el signal aunque SessionStorage esté bloqueado.
    }
  }
}
