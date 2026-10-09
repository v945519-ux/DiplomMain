export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Tokens {
  access: string;
  refresh: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  is_active: boolean;
  products_count: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  image: string | null;
  category: number;
  category_name: string;
  is_available: boolean;
  is_popular: boolean;
  weight: number | null;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  subtotal: string;
}

export interface ProductDetail extends Product {
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_price: string;
  total_items: number;
}

export interface Favorite {
  id: number;
  product: Product;
  created_at: string;
}

export interface OrderItem {
  id: number;
  product_name: string;
  price: string;
  quantity: number;
  subtotal: string;
}

export interface Order {
  id: number;
  status: string;
  status_display: string;
  delivery_type: string;
  delivery_type_display: string;
  payment_method: string;
  payment_method_display: string;
  delivery_address: string;
  phone: string;
  comment: string;
  total_price: string;
  items: OrderItem[];
  created_at: string;
}

export interface UserProfile {
  user: User;
  phone: string;
  address: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface OrderChoices {
  delivery_types: { value: string; label: string }[];
  payment_methods: { value: string; label: string }[];
  statuses?: { value: string; label: string }[];
}

export interface RegisterPayload {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  password: string;
  password_confirm: string;
}

export interface ProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}
