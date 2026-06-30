import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { CartItem } from '../data/cart-store';
import { Product } from '../models/product';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.scss',
})
export class CartDrawer {
  readonly cartItems = input.required<CartItem[]>();
  readonly cartCount = input.required<number>();
  readonly cartSubtotal = input.required<number>();

  readonly cartClosed = output<void>();
  readonly checkoutRequested = output<void>();
  readonly cartCleared = output<void>();
  readonly quantityIncreased = output<Product>();
  readonly quantityDecreased = output<string>();
  readonly itemRemoved = output<string>();

  closeCart(): void {
    this.cartClosed.emit();
  }

  requestCheckout(): void {
    this.checkoutRequested.emit();
  }

  clearCart(): void {
    this.cartCleared.emit();
  }

  increaseQuantity(product: Product): void {
    this.quantityIncreased.emit(product);
  }

  decreaseQuantity(productId: string): void {
    this.quantityDecreased.emit(productId);
  }

  removeItem(productId: string): void {
    this.itemRemoved.emit(productId);
  }
}
