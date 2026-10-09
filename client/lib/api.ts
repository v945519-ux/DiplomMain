import type {
  Cart,
  Category,
  Favorite,
  Order,
  OrderChoices,
  Paginated,
  ProfileUpdatePayload,
  Product,
  ProductDetail,
  RegisterPayload,
  Tokens,
  User,
  UserProfile,
} from "./types";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"
).replace(/\/$/, "");
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

function getTokens(): Tokens | null {
  if (typeof window === "undefined") return null;
  const access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");
  if (!access || !refresh) return null;
  return { access, refresh };
}

export function saveTokens(tokens: Tokens) {
  localStorage.setItem("access_token", tokens.access);
  localStorage.setItem("refresh_token", tokens.refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

async function refreshAccessToken(): Promise<string | null> {
  const tokens = getTokens();
  if (!tokens?.refresh) return null;

  const res = await fetch(`${API_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: tokens.refresh }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = await res.json();
  localStorage.setItem("access_token", data.access);
  if (data.refresh) {
    localStorage.setItem("refresh_token", data.refresh);
  }
  return data.access;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const tokens = getTokens();
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (tokens?.access) {
    headers.set("Authorization", `Bearer ${tokens.access}`);
  }

  let res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && tokens?.refresh) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      headers.set("Authorization", `Bearer ${newAccess}`);
      res = await fetch(`${API_URL}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const message =
      typeof err === "object" && err !== null ? JSON.stringify(err) : String(err);
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Catalog endpoints use Django's PageNumberPagination (12 items per page).
// Keep the existing response shape, but include every page of the selection.
async function fetchCatalog<T>(path: string): Promise<Paginated<T>> {
  const [endpoint, query] = path.split("?");
  const params = new URLSearchParams(query);
  const results: T[] = [];
  let page = 1;

  while (true) {
    params.set("page", String(page));
    const response = await apiFetch<Paginated<T>>(`${endpoint}?${params}`);
    results.push(...response.results);
    if (!response.next) {
      return { ...response, results, next: null, previous: null };
    }
    page += 1;
  }
}

export const api = {
  login: (username: string, password: string) =>
    apiFetch<{ user: User; tokens: Tokens; message: string }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (data: RegisterPayload) =>
    apiFetch<{ user: User; tokens: Tokens; message: string }>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => apiFetch<User>("/auth/me/"),
  profile: () => apiFetch<UserProfile>("/auth/profile/"),
  updateProfile: (data: ProfileUpdatePayload) =>
    apiFetch<Record<string, unknown>>("/auth/profile/", {
      method: "PATCH",
      body: JSON.stringify(data),
    }).then(() => api.profile()),

  categories: () => fetchCatalog<Category>("/catalog/categories/"),

  product: (slug: string) =>
    apiFetch<ProductDetail>(`/catalog/products/${encodeURIComponent(slug)}/`),

  products: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchCatalog<Product>(`/catalog/products/${query}`);
  },

  cart: () => apiFetch<Cart>("/cart/"),
  addToCart: (product_id: number, quantity = 1) =>
    apiFetch<Cart>("/cart/add/", {
      method: "POST",
      body: JSON.stringify({ product_id, quantity }),
    }),
  updateCartItem: (itemId: number, quantity: number) =>
    apiFetch<Cart>(`/cart/items/${itemId}/`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }),
  removeCartItem: (itemId: number) =>
    apiFetch<Cart>(`/cart/items/${itemId}/`, { method: "DELETE" }),
  clearCart: () => apiFetch<{ message: string }>("/cart/", { method: "DELETE" }),

  favorites: () =>
    apiFetch<Paginated<Favorite>>("/favorites/").then((r) => r.results),
  addFavorite: (product_id: number) =>
    apiFetch<Favorite>("/favorites/", {
      method: "POST",
      body: JSON.stringify({ product_id }),
    }),
  removeFavorite: (product_id: number) =>
    apiFetch<void>(`/favorites/${product_id}/`, { method: "DELETE" }),

  orders: () =>
    apiFetch<Paginated<Order>>("/orders/").then((r) => r.results),
  orderChoices: () => apiFetch<OrderChoices>("/orders/choices/"),
  createOrder: (data: {
    delivery_type: string;
    payment_method: string;
    phone: string;
    delivery_address?: string;
    comment?: string;
  }) =>
    apiFetch<Order>("/orders/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
