import { Category } from '../models/category';
import { Product } from '../models/product';

type DemoCategorySlug =
  | 'accessories'
  | 'computers'
  | 'monitors'
  | 'audio'
  | 'storage'
  | 'networking';

const CATEGORY_BY_SLUG: Record<DemoCategorySlug, Category> = {
  accessories: {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Accessories',
    slug: 'accessories',
  },
  computers: {
    id: '10000000-0000-4000-8000-000000000002',
    name: 'Computers',
    slug: 'computers',
  },
  monitors: {
    id: '10000000-0000-4000-8000-000000000003',
    name: 'Monitors',
    slug: 'monitors',
  },
  audio: {
    id: '10000000-0000-4000-8000-000000000004',
    name: 'Audio',
    slug: 'audio',
  },
  storage: {
    id: '10000000-0000-4000-8000-000000000005',
    name: 'Storage',
    slug: 'storage',
  },
  networking: {
    id: '10000000-0000-4000-8000-000000000006',
    name: 'Networking',
    slug: 'networking',
  },
};

export const DEMO_CATEGORIES: ReadonlyArray<Category> =
  Object.values(CATEGORY_BY_SLUG);

function createProduct(
  sequence: number,
  sku: string,
  name: string,
  description: string,
  price: number,
  stock: number,
  imageFilename: string,
  categorySlug: DemoCategorySlug,
): Product {
  const category = CATEGORY_BY_SLUG[categorySlug];
  const productIdSuffix = sequence.toString().padStart(12, '0');

  return {
    id: `20000000-0000-4000-8000-${productIdSuffix}`,
    sku,
    name,
    description,
    price,
    stock,
    imageUrl: `/assets/products/${imageFilename}`,
    categoryId: category.id,
    categoryName: category.name,
    categorySlug: category.slug,
  };
}

export const DEMO_PRODUCTS: ReadonlyArray<Product> = [
  createProduct(
    1,
    'KEYBOARD-001',
    'Mechanical Keyboard',
    'Compact mechanical keyboard with tactile switches, aluminum frame and customizable RGB lighting.',
    89.99,
    25,
    'mechanical-keyboard.png',
    'accessories',
  ),
  createProduct(
    2,
    'MOUSE-001',
    'Wireless Mouse',
    'Ergonomic wireless mouse with adjustable DPI, silent clicks and long battery life.',
    39.99,
    40,
    'wireless-mouse.png',
    'accessories',
  ),
  createProduct(
    3,
    'LAPTOP-001',
    'Ultrabook 14',
    'Lightweight 14-inch laptop with fast SSD storage, high-resolution display and all-day battery.',
    999.99,
    12,
    'ultrabook-14.png',
    'computers',
  ),
  createProduct(
    4,
    'MONITOR-001',
    '27-inch Monitor',
    '27-inch IPS monitor with sharp image quality, slim bezels and USB-C connectivity.',
    249.99,
    18,
    'monitor-27.png',
    'monitors',
  ),
  createProduct(
    5,
    'HEADSET-001',
    'Studio Headset',
    'Closed-back headset with clear microphone, soft ear cushions and balanced sound.',
    74.99,
    22,
    'studio-headset.png',
    'audio',
  ),
  createProduct(
    6,
    'SPEAKER-001',
    'Bluetooth Speaker',
    'Portable Bluetooth speaker with compact body, deep bass and water-resistant design.',
    59.99,
    30,
    'bluetooth-speaker.png',
    'audio',
  ),
  createProduct(
    7,
    'SSD-001',
    'Portable SSD 1TB',
    'Fast external SSD with USB-C connection, compact aluminum body and 1TB capacity.',
    119.99,
    16,
    'portable-ssd.png',
    'storage',
  ),
  createProduct(
    8,
    'DOCK-001',
    'USB-C Dock',
    'Multi-port USB-C dock with HDMI, Ethernet, card reader and power delivery support.',
    69.99,
    20,
    'usb-c-dock.png',
    'accessories',
  ),
  createProduct(
    9,
    'TABLET-001',
    'Tablet Pro 11',
    '11-inch tablet with bright display, slim metal body and support for keyboard accessories.',
    649.99,
    10,
    'tablet-pro-11.png',
    'computers',
  ),
  createProduct(
    10,
    'WEBCAM-001',
    'Webcam 1080p',
    'Full HD webcam with autofocus, privacy cover and dual microphones for video calls.',
    49.99,
    35,
    'webcam-1080p.png',
    'accessories',
  ),
  createProduct(
    11,
    'ROUTER-001',
    'Wi-Fi 6 Router',
    'Dual-band Wi-Fi 6 router designed for stable streaming, gaming and home office setups.',
    129.99,
    14,
    'wifi-6-router.png',
    'networking',
  ),
  createProduct(
    12,
    'MIC-001',
    'USB Microphone',
    'USB condenser microphone with desk stand, mute control and clean voice capture.',
    84.99,
    19,
    'usb-microphone.png',
    'audio',
  ),
];
