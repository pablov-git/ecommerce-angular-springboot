import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { OrderStore } from '../data/order-store';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.scss',
})
export class OrderConfirmation {
  private readonly orderStore = inject(OrderStore);
  private readonly router = inject(Router);

  readonly orderSummary = this.orderStore.orderSummary;

  backToProducts(): void {
    this.orderStore.clear();

    void this.router.navigate(['/products']);
  }
}
