import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { Product } from '../models/product';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly addRequested = output<Product>();

  addToCart(): void {
    if (this.product().stock <= 0) {
      return;
    }

    this.addRequested.emit(this.product());
  }
}
