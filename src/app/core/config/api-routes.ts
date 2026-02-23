export const ApiRoutes = {
  orders: 'orders',
  products: 'products',
  categories: 'categories',
  customers: 'customers',
  auth: {
    login: 'auth/login',
    logout: 'auth/logout',
    refresh: 'auth/refresh'
  }
} as const;
