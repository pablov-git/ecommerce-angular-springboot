import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';

import { CartItem } from '../data/cart-store';

export interface CheckoutFormValue {
  name: string;
  email: string;
  address: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  readonly cartItems = input.required<CartItem[]>();
  readonly cartSubtotal = input.required<number>();

  readonly backToCatalog = output<void>();
  readonly orderPlaced = output<CheckoutFormValue>();

  readonly name = signal('');
  readonly email = signal('');
  readonly address = signal('');

  readonly isValid = computed(() => {
    const name = this.name().trim();
    const email = this.email().trim();
    const address = this.address().trim();

    return (
      this.cartItems().length > 0 &&
      name.length >= 2 &&
      this.isValidEmail(email) &&
      address.length >= 5
    );
  });

  onBackToCatalog(): void {
    this.backToCatalog.emit();
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

    this.orderPlaced.emit({
      name: this.name().trim(),
      email: this.email().trim(),
      address: this.address().trim(),
    });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
