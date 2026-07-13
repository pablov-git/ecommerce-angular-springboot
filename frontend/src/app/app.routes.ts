import { Routes } from '@angular/router';

import { Checkout } from './features/catalog/checkout/checkout';
import { OrderConfirmation } from './features/catalog/order-confirmation/order-confirmation';
import { ProductCatalog } from './features/catalog/product-catalog/product-catalog';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'products',
  },
  {
    path: 'products',
    component: ProductCatalog,
  },
  {
    path: 'checkout',
    component: Checkout,
  },
  {
    path: 'order-confirmation',
    component: OrderConfirmation,
  },
  {
    path: '**',
    redirectTo: 'products',
  },
];
