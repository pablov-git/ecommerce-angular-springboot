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

  readonly nameTouched = signal(false);
  readonly emailTouched = signal(false);
  readonly addressTouched = signal(false);
  readonly submitAttempted = signal(false);

  readonly isSubmitting = signal(false);
  readonly orderErrorMessage = signal('');

  readonly nameError = computed(() => {
    if (!this.nameTouched() && !this.submitAttempted()) {
      return '';
    }

    return this.validateName(this.name());
  });

  readonly emailError = computed(() => {
    if (!this.emailTouched() && !this.submitAttempted()) {
      return '';
    }

    return this.validateEmail(this.email());
  });

  readonly addressError = computed(() => {
    if (!this.addressTouched() && !this.submitAttempted()) {
      return '';
    }

    return this.validateAddress(this.address());
  });

  readonly isValid = computed(() => {
    return (
      this.cartItems().length > 0 &&
      this.validateName(this.name()) === '' &&
      this.validateEmail(this.email()) === '' &&
      this.validateAddress(this.address()) === ''
    );
  });

  backToProducts(): void {
    void this.router.navigate(['/products']);
  }

  onNameChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.name.set(input.value);
    this.clearOrderError();
  }

  onEmailChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.email.set(input.value);
    this.clearOrderError();
  }

  onAddressChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.address.set(input.value);
    this.clearOrderError();
  }

  markNameTouched(): void {
    this.nameTouched.set(true);
  }

  markEmailTouched(): void {
    this.emailTouched.set(true);
  }

  markAddressTouched(): void {
    this.addressTouched.set(true);
  }

  placeOrder(event: Event): void {
    event.preventDefault();

    this.submitAttempted.set(true);
    this.nameTouched.set(true);
    this.emailTouched.set(true);
    this.addressTouched.set(true);
    this.orderErrorMessage.set('');

    if (!this.isValid() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    this.orderApi
      .createOrder({
        customerName: this.name().trim(),
        customerEmail: this.email().trim(),
        shippingAddress: this.address().trim(),
        items: this.cartItems().map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      })
      .subscribe({
        next: (orderResponse) => {
          this.orderStore.setOrderSummary(orderResponse);
          this.cartStore.clear();

          void this.router.navigate(['/order-confirmation']);
        },
        error: () => {
          this.orderErrorMessage.set(
            'The order could not be placed. Check your cart and try again.',
          );
          this.isSubmitting.set(false);
        },
      });
  }

  private validateName(value: string): string {
    const name = value.trim();

    if (!name) {
      return 'Enter your name.';
    }

    if (name.length < 2) {
      return 'The name must contain at least 2 characters.';
    }

    if (name.length > 160) {
      return 'The name cannot exceed 160 characters.';
    }

    return '';
  }

  private validateEmail(value: string): string {
    const email = value.trim();

    if (!email) {
      return 'Enter your email address.';
    }

    if (email.length > 180) {
      return 'The email cannot exceed 180 characters.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Enter a valid email, for example name@example.com.';
    }

    return '';
  }

  private validateAddress(value: string): string {
    const address = value.trim();

    if (!address) {
      return 'Enter a shipping address.';
    }

    if (address.length < 5) {
      return 'The shipping address is too short.';
    }

    if (address.length > 500) {
      return 'The address cannot exceed 500 characters.';
    }

    return '';
  }

  private clearOrderError(): void {
    if (this.orderErrorMessage()) {
      this.orderErrorMessage.set('');
    }
  }
}
