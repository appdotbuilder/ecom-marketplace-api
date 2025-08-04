
import { z } from 'zod';

// User roles enum
export const userRoleSchema = z.enum(['buyer', 'seller', 'admin']);
export type UserRole = z.infer<typeof userRoleSchema>;

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password_hash: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  phone_number: z.string().nullable(),
  role: userRoleSchema,
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Store schema
export const storeSchema = z.object({
  id: z.number(),
  seller_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  city: z.string(),
  regency: z.string(),
  full_address: z.string(),
  phone_number: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Store = z.infer<typeof storeSchema>;

// Product category schema
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Category = z.infer<typeof categorySchema>;

// Product schema
export const productSchema = z.object({
  id: z.number(),
  store_id: z.number(),
  category_id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  stock_quantity: z.number().int(),
  image_urls: z.array(z.string()),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Product = z.infer<typeof productSchema>;

// Cart schema
export const cartSchema = z.object({
  id: z.number(),
  buyer_id: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Cart = z.infer<typeof cartSchema>;

// Cart item schema
export const cartItemSchema = z.object({
  id: z.number(),
  cart_id: z.number(),
  product_id: z.number(),
  quantity: z.number().int(),
  added_at: z.coerce.date()
});

export type CartItem = z.infer<typeof cartItemSchema>;

// Order status enum
export const orderStatusSchema = z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

// Order schema
export const orderSchema = z.object({
  id: z.number(),
  buyer_id: z.number(),
  store_id: z.number(),
  total_amount: z.number(),
  status: orderStatusSchema,
  shipping_address: z.string(),
  phone_number: z.string(),
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Order = z.infer<typeof orderSchema>;

// Order item schema
export const orderItemSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  product_id: z.number(),
  quantity: z.number().int(),
  price_at_time: z.number(),
  created_at: z.coerce.date()
});

export type OrderItem = z.infer<typeof orderItemSchema>;

// User report schema
export const userReportSchema = z.object({
  id: z.number(),
  reporter_id: z.number(),
  reported_user_id: z.number().nullable(),
  reported_product_id: z.number().nullable(),
  reported_store_id: z.number().nullable(),
  reason: z.string(),
  description: z.string(),
  status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type UserReport = z.infer<typeof userReportSchema>;

// Input schemas for creating/updating entities

// User registration input
export const registerUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone_number: z.string().nullable(),
  role: userRoleSchema
});

export type RegisterUserInput = z.infer<typeof registerUserInputSchema>;

// User login input
export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export type LoginInput = z.infer<typeof loginInputSchema>;

// Store creation input
export const createStoreInputSchema = z.object({
  seller_id: z.number(),
  name: z.string().min(1),
  description: z.string().nullable(),
  city: z.string().min(1),
  regency: z.string().min(1),
  full_address: z.string().min(1),
  phone_number: z.string().nullable()
});

export type CreateStoreInput = z.infer<typeof createStoreInputSchema>;

// Product creation input
export const createProductInputSchema = z.object({
  store_id: z.number(),
  category_id: z.number(),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  stock_quantity: z.number().int().nonnegative(),
  image_urls: z.array(z.string().url())
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

// Product update input
export const updateProductInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  stock_quantity: z.number().int().nonnegative().optional(),
  image_urls: z.array(z.string().url()).optional(),
  is_active: z.boolean().optional()
});

export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;

// Add to cart input
export const addToCartInputSchema = z.object({
  buyer_id: z.number(),
  product_id: z.number(),
  quantity: z.number().int().positive()
});

export type AddToCartInput = z.infer<typeof addToCartInputSchema>;

// Update cart item input
export const updateCartItemInputSchema = z.object({
  cart_item_id: z.number(),
  quantity: z.number().int().positive()
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemInputSchema>;

// Checkout input
export const checkoutInputSchema = z.object({
  buyer_id: z.number(),
  shipping_address: z.string().min(1),
  phone_number: z.string().min(1),
  notes: z.string().nullable()
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

// Update order status input
export const updateOrderStatusInputSchema = z.object({
  order_id: z.number(),
  status: orderStatusSchema
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusInputSchema>;

// Product search/filter input
export const searchProductsInputSchema = z.object({
  query: z.string().optional(),
  category_id: z.number().optional(),
  city: z.string().optional(),
  regency: z.string().optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0)
});

export type SearchProductsInput = z.infer<typeof searchProductsInputSchema>;

// Create report input
export const createReportInputSchema = z.object({
  reporter_id: z.number(),
  reported_user_id: z.number().nullable(),
  reported_product_id: z.number().nullable(),
  reported_store_id: z.number().nullable(),
  reason: z.string().min(1),
  description: z.string().min(1)
});

export type CreateReportInput = z.infer<typeof createReportInputSchema>;
