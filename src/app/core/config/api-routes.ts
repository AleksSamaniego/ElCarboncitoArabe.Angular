export const ApiRoutes = {
  orders: 'orders',
  products: 'products',
  categories: 'categories',
  customers: 'customers',
  tables: 'tables',
  platforms: 'platforms',
  paymentMethods: 'payment-methods',
  auth: {
    login: 'auth/login',
    logout: 'auth/logout',
    refresh: 'auth/refresh'
  }
} as const;
