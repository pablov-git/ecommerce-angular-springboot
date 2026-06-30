import { Component, input, output } from '@angular/core';

import { Product } from '../models/product';

@Component({
  selector: 'app-add-to-cart-confirmation',
  standalone: true,
  templateUrl: './add-to-cart-confirmation.html',
  styleUrl: './add-to-cart-confirmation.scss',
})
export class AddToCartConfirmation {
  readonly product = input.required<Product>();

  readonly closed = output<void>();
  readonly viewCartRequested = output<void>();

  close(): void {
    this.closed.emit();
  }

  viewCart(): void {
    this.viewCartRequested.emit();
  }
}
