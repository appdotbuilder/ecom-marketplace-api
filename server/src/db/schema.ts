
import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['buyer', 'seller', 'admin']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']);
export const reportStatusEnum = pgEnum('report_status', ['pending', 'reviewed', 'resolved', 'dismissed']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  phone_number: text('phone_number'),
  role: userRoleEnum('role').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Stores table
export const storesTable = pgTable('stores', {
  id: serial('id').primaryKey(),
  seller_id: integer('seller_id').notNull().references(() => usersTable.id),
  name: text('name').notNull(),
  description: text('description'),
  city: text('city').notNull(),
  regency: text('regency').notNull(),
  full_address: text('full_address').notNull(),
  phone_number: text('phone_number'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Categories table
export const categoriesTable = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Products table
export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  store_id: integer('store_id').notNull().references(() => storesTable.id),
  category_id: integer('category_id').notNull().references(() => categoriesTable.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock_quantity: integer('stock_quantity').notNull(),
  image_urls: json('image_urls').$type<string[]>().notNull().default([]),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Carts table
export const cartsTable = pgTable('carts', {
  id: serial('id').primaryKey(),
  buyer_id: integer('buyer_id').notNull().references(() => usersTable.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Cart items table
export const cartItemsTable = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  cart_id: integer('cart_id').notNull().references(() => cartsTable.id),
  product_id: integer('product_id').notNull().references(() => productsTable.id),
  quantity: integer('quantity').notNull(),
  added_at: timestamp('added_at').defaultNow().notNull(),
});

// Orders table
export const ordersTable = pgTable('orders', {
  id: serial('id').primaryKey(),
  buyer_id: integer('buyer_id').notNull().references(() => usersTable.id),
  store_id: integer('store_id').notNull().references(() => storesTable.id),
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),
  shipping_address: text('shipping_address').notNull(),
  phone_number: text('phone_number').notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Order items table
export const orderItemsTable = pgTable('order_items', {
  id: serial('id').primaryKey(),
  order_id: integer('order_id').notNull().references(() => ordersTable.id),
  product_id: integer('product_id').notNull().references(() => productsTable.id),
  quantity: integer('quantity').notNull(),
  price_at_time: numeric('price_at_time', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// User reports table
export const userReportsTable = pgTable('user_reports', {
  id: serial('id').primaryKey(),
  reporter_id: integer('reporter_id').notNull().references(() => usersTable.id),
  reported_user_id: integer('reported_user_id').references(() => usersTable.id),
  reported_product_id: integer('reported_product_id').references(() => productsTable.id),
  reported_store_id: integer('reported_store_id').references(() => storesTable.id),
  reason: text('reason').notNull(),
  description: text('description').notNull(),
  status: reportStatusEnum('status').notNull().default('pending'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(usersTable, ({ many, one }) => ({
  stores: many(storesTable),
  carts: many(cartsTable),
  orders: many(ordersTable),
  reportsCreated: many(userReportsTable, { relationName: 'reporter' }),
  reportsReceived: many(userReportsTable, { relationName: 'reported_user' }),
}));

export const storesRelations = relations(storesTable, ({ one, many }) => ({
  seller: one(usersTable, {
    fields: [storesTable.seller_id],
    references: [usersTable.id],
  }),
  products: many(productsTable),
  orders: many(ordersTable),
  reports: many(userReportsTable, { relationName: 'reported_store' }),
}));

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  products: many(productsTable),
}));

export const productsRelations = relations(productsTable, ({ one, many }) => ({
  store: one(storesTable, {
    fields: [productsTable.store_id],
    references: [storesTable.id],
  }),
  category: one(categoriesTable, {
    fields: [productsTable.category_id],
    references: [categoriesTable.id],
  }),
  cartItems: many(cartItemsTable),
  orderItems: many(orderItemsTable),
  reports: many(userReportsTable, { relationName: 'reported_product' }),
}));

export const cartsRelations = relations(cartsTable, ({ one, many }) => ({
  buyer: one(usersTable, {
    fields: [cartsTable.buyer_id],
    references: [usersTable.id],
  }),
  items: many(cartItemsTable),
}));

export const cartItemsRelations = relations(cartItemsTable, ({ one }) => ({
  cart: one(cartsTable, {
    fields: [cartItemsTable.cart_id],
    references: [cartsTable.id],
  }),
  product: one(productsTable, {
    fields: [cartItemsTable.product_id],
    references: [productsTable.id],
  }),
}));

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  buyer: one(usersTable, {
    fields: [ordersTable.buyer_id],
    references: [usersTable.id],
  }),
  store: one(storesTable, {
    fields: [ordersTable.store_id],
    references: [storesTable.id],
  }),
  items: many(orderItemsTable),
}));

export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [orderItemsTable.order_id],
    references: [ordersTable.id],
  }),
  product: one(productsTable, {
    fields: [orderItemsTable.product_id],
    references: [productsTable.id],
  }),
}));

export const userReportsRelations = relations(userReportsTable, ({ one }) => ({
  reporter: one(usersTable, {
    fields: [userReportsTable.reporter_id],
    references: [usersTable.id],
    relationName: 'reporter',
  }),
  reportedUser: one(usersTable, {
    fields: [userReportsTable.reported_user_id],
    references: [usersTable.id],
    relationName: 'reported_user',
  }),
  reportedProduct: one(productsTable, {
    fields: [userReportsTable.reported_product_id],
    references: [productsTable.id],
    relationName: 'reported_product',
  }),
  reportedStore: one(storesTable, {
    fields: [userReportsTable.reported_store_id],
    references: [storesTable.id],
    relationName: 'reported_store',
  }),
}));

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  stores: storesTable,
  categories: categoriesTable,
  products: productsTable,
  carts: cartsTable,
  cartItems: cartItemsTable,
  orders: ordersTable,
  orderItems: orderItemsTable,
  userReports: userReportsTable,
};

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Store = typeof storesTable.$inferSelect;
export type NewStore = typeof storesTable.$inferInsert;
export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;
export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert;
export type Cart = typeof cartsTable.$inferSelect;
export type NewCart = typeof cartsTable.$inferInsert;
export type CartItem = typeof cartItemsTable.$inferSelect;
export type NewCartItem = typeof cartItemsTable.$inferInsert;
export type Order = typeof ordersTable.$inferSelect;
export type NewOrder = typeof ordersTable.$inferInsert;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type NewOrderItem = typeof orderItemsTable.$inferInsert;
export type UserReport = typeof userReportsTable.$inferSelect;
export type NewUserReport = typeof userReportsTable.$inferInsert;
