import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface OrderItemResponse {
  productId: string;
  productSku: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrderApi {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:8081/api';

  createOrder(request: CreateOrderRequest) {
    return this.http.post<OrderResponse>(`${this.apiBaseUrl}/orders`, request);
  }
}
