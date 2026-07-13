import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CartStore } from '../data/cart-store';
import { OrderApi } from '../data/order-api';
import { OrderStore } from '../data/order-store';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private readonly cartStore = inject(CartStore);
  private readonly orderApi = inject(OrderApi);
  private readonly orderStore = inject(OrderStore);
  private readonly router = inject(Router);

  readonly cartItems = this.cartStore.cartItems;
  readonly cartSubtotal = this.cartStore.cartSubtotal;

  readonly name = signal('');
  readonly email = signal('');
  readonly address = signal('');

  readonly isSubmitting = signal(false);
  readonly orderErrorMessage = signal('');

  readonly isValid = computed(() => {
    const name = this.name().trim();
    const email = this.email().trim();
    const address = this.address().trim();

    return (
      this.cartItems().length > 0 &&
      name.length >= 2 &&
      this.isValidEmail(email) &&
      address.length >= 5 &&
      !this.isSubmitting()
    );
  });

  backToProducts(): void {
    void this.router.navigate(['/products']);
  }

  onNameChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.name.set(input.value);
  }

  onEmailChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.email.set(input.value);
  }

  onAddressChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.address.set(input.value);
  }

  placeOrder(event: Event): void {
    event.preventDefault();

    if (!this.isValid()) {
      return;
    }

    this.isSubmitting.set(true);
    this.orderErrorMessage.set('');

    this.orderApi.createOrder({
      customerName: this.name().trim(),
      customerEmail: this.email().trim(),
      shippingAddress: this.address().trim(),
      items: this.cartItems().map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    }).subscribe({
      next: (orderResponse) => {
        this.orderStore.setOrderSummary(orderResponse);
        this.cartStore.clear();

        void this.router.navigate(['/order-confirmation']);
      },
      error: () => {
        this.orderErrorMessage.set(
          'The order could not be placed. Please review your cart and try again.'
        );
        this.isSubmitting.set(false);
      },
    });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
