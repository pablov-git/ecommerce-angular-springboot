import { Injectable } from '@angular/core';

import { Category } from '../models/category';
import {
  CreateOrderRequest,
  OrderItemResponse,
  OrderResponse,
} from '../models/order';
import { Product } from '../models/product';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from './demo-data';

@Injectable({
  providedIn: 'root',
})
export class DemoStore {
  private readonly productsStorageKey =
    'pixeltronics-demo-products-v1';

  getCategories(): Category[] {
    return DEMO_CATEGORIES.map((category) => ({
      ...category,
    }));
  }

  getProducts(): Product[] {
    return this.loadProducts().map((product) => ({
      ...product,
    }));
  }

  createOrder(request: CreateOrderRequest): OrderResponse {
    if (request.items.length === 0) {
      throw new Error(
        'The order must contain at least one product.',
      );
    }

    const products = this.loadProducts();
    const orderItems: OrderItemResponse[] = [];

    for (const requestedItem of request.items) {
      if (
        !Number.isInteger(requestedItem.quantity) ||
        requestedItem.quantity < 1
      ) {
        throw new Error(
          'Every order item must have a valid quantity.',
        );
      }

      const product = products.find(
        (currentProduct) =>
          currentProduct.id === requestedItem.productId,
      );

      if (!product) {
        throw new Error(
          `Product not found: ${requestedItem.productId}`,
        );
      }

      if (requestedItem.quantity > product.stock) {
        throw new Error(
          `Not enough stock for product: ${product.name}`,
        );
      }

      const lineTotal = this.roundMoney(
        product.price * requestedItem.quantity,
      );

      orderItems.push({
        productId: product.id,
        productSku: product.sku,
        productName: product.name,
        unitPrice: product.price,
        quantity: requestedItem.quantity,
        lineTotal,
      });

      product.stock -= requestedItem.quantity;
    }

    // Solo guardamos los cambios cuando todos los productos han sido validados.
    // Así evitamos descontar parcialmente el stock si uno de los artículos falla.
    this.saveProducts(products);

    const id = this.createUuid();

    return {
      id,
      orderNumber: `ORD-${id.substring(0, 8).toUpperCase()}`,
      customerName: request.customerName.trim(),
      customerEmail: request.customerEmail.trim(),
      shippingAddress: request.shippingAddress.trim(),
      status: 'CREATED',
      totalAmount: this.roundMoney(
        orderItems.reduce(
          (total, item) => total + item.lineTotal,
          0,
        ),
      ),
      createdAt: new Date().toISOString(),
      items: orderItems,
    };
  }

  private loadProducts(): Product[] {
    const seededProducts = this.createSeededProducts();

    if (typeof localStorage === 'undefined') {
      return seededProducts;
    }

    try {
      const storedProducts = localStorage.getItem(
        this.productsStorageKey,
      );

      if (!storedProducts) {
        this.saveProducts(seededProducts);
        return seededProducts;
      }

      const parsedProducts = JSON.parse(
        storedProducts,
      ) as unknown;

      if (!this.isProductArray(parsedProducts)) {
        this.saveProducts(seededProducts);
        return seededProducts;
      }

      return parsedProducts.map((product) => ({
        ...product,
      }));
    } catch {
      this.saveProducts(seededProducts);
      return seededProducts;
    }
  }

  private saveProducts(products: Product[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(
        this.productsStorageKey,
        JSON.stringify(products),
      );
    } catch {
      // Si el navegador bloquea LocalStorage, la demo sigue funcionando durante la navegación actual.
    }
  }

  private createSeededProducts(): Product[] {
    return DEMO_PRODUCTS.map((product) => ({
      ...product,
    }));
  }

  private isProductArray(value: unknown): value is Product[] {
    return (
      Array.isArray(value) &&
      value.length === DEMO_PRODUCTS.length &&
      value.every((product) => this.isProduct(product))
    );
  }

  private isProduct(value: unknown): value is Product {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const product = value as Partial<Product>;

    return (
      typeof product.id === 'string' &&
      typeof product.sku === 'string' &&
      typeof product.name === 'string' &&
      typeof product.description === 'string' &&
      typeof product.price === 'number' &&
      Number.isFinite(product.price) &&
      typeof product.stock === 'number' &&
      Number.isInteger(product.stock) &&
      product.stock >= 0 &&
      typeof product.imageUrl === 'string' &&
      typeof product.categoryId === 'string' &&
      typeof product.categoryName === 'string' &&
      typeof product.categorySlug === 'string'
    );
  }

  private createUuid(): string {
    if (
      typeof globalThis.crypto !== 'undefined' &&
      typeof globalThis.crypto.randomUUID === 'function'
    ) {
      return globalThis.crypto.randomUUID();
    }

    const randomPart = Math.random()
      .toString(16)
      .slice(2)
      .padEnd(12, '0')
      .slice(0, 12);

    return `00000000-0000-4000-8000-${randomPart}`;
  }

  private roundMoney(value: number): number {
    return (
      Math.round((value + Number.EPSILON) * 100) / 100
    );
  }
}
