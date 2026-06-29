import { Component } from '@angular/core';

import { ProductCatalog } from './features/catalog/product-catalog/product-catalog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProductCatalog],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
