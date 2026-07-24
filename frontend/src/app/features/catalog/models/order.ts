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
