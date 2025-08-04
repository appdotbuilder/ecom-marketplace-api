
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  registerUserInputSchema,
  loginInputSchema,
  createStoreInputSchema,
  createProductInputSchema,
  updateProductInputSchema,
  addToCartInputSchema,
  updateCartItemInputSchema,
  checkoutInputSchema,
  updateOrderStatusInputSchema,
  searchProductsInputSchema,
  createReportInputSchema
} from './schema';

// Import handlers
import { registerUser } from './handlers/register_user';
import { loginUser } from './handlers/login_user';
import { createStore } from './handlers/create_store';
import { getStoresBySeller } from './handlers/get_stores_by_seller';
import { createProduct } from './handlers/create_product';
import { updateProduct } from './handlers/update_product';
import { searchProducts } from './handlers/search_products';
import { getProductById } from './handlers/get_product_by_id';
import { getProductsByStore } from './handlers/get_products_by_store';
import { addToCart } from './handlers/add_to_cart';
import { getCartItems } from './handlers/get_cart_items';
import { updateCartItem } from './handlers/update_cart_item';
import { removeCartItem } from './handlers/remove_cart_item';
import { checkout } from './handlers/checkout';
import { getOrdersByBuyer } from './handlers/get_orders_by_buyer';
import { getOrdersByStore } from './handlers/get_orders_by_store';
import { updateOrderStatus } from './handlers/update_order_status';
import { getCategories } from './handlers/get_categories';
import { createCategory } from './handlers/create_category';
import { createReport } from './handlers/create_report';
import { getReports } from './handlers/get_reports';
import { updateReportStatus } from './handlers/update_report_status';
import { deactivateUser } from './handlers/deactivate_user';
import { deactivateProduct } from './handlers/deactivate_product';
import { getPlatformStats } from './handlers/get_platform_stats';
import { z } from 'zod';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication
  registerUser: publicProcedure
    .input(registerUserInputSchema)
    .mutation(({ input }) => registerUser(input)),

  loginUser: publicProcedure
    .input(loginInputSchema)
    .mutation(({ input }) => loginUser(input)),

  // Store management
  createStore: publicProcedure
    .input(createStoreInputSchema)
    .mutation(({ input }) => createStore(input)),

  getStoresBySeller: publicProcedure
    .input(z.object({ sellerId: z.number() }))
    .query(({ input }) => getStoresBySeller(input.sellerId)),

  // Product management
  createProduct: publicProcedure
    .input(createProductInputSchema)
    .mutation(({ input }) => createProduct(input)),

  updateProduct: publicProcedure
    .input(updateProductInputSchema)
    .mutation(({ input }) => updateProduct(input)),

  searchProducts: publicProcedure
    .input(searchProductsInputSchema)
    .query(({ input }) => searchProducts(input)),

  getProductById: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(({ input }) => getProductById(input.productId)),

  getProductsByStore: publicProcedure
    .input(z.object({ storeId: z.number() }))
    .query(({ input }) => getProductsByStore(input.storeId)),

  // Cart management
  addToCart: publicProcedure
    .input(addToCartInputSchema)
    .mutation(({ input }) => addToCart(input)),

  getCartItems: publicProcedure
    .input(z.object({ buyerId: z.number() }))
    .query(({ input }) => getCartItems(input.buyerId)),

  updateCartItem: publicProcedure
    .input(updateCartItemInputSchema)
    .mutation(({ input }) => updateCartItem(input)),

  removeCartItem: publicProcedure
    .input(z.object({ cartItemId: z.number() }))
    .mutation(({ input }) => removeCartItem(input.cartItemId)),

  // Order management
  checkout: publicProcedure
    .input(checkoutInputSchema)
    .mutation(({ input }) => checkout(input)),

  getOrdersByBuyer: publicProcedure
    .input(z.object({ buyerId: z.number() }))
    .query(({ input }) => getOrdersByBuyer(input.buyerId)),

  getOrdersByStore: publicProcedure
    .input(z.object({ storeId: z.number() }))
    .query(({ input }) => getOrdersByStore(input.storeId)),

  updateOrderStatus: publicProcedure
    .input(updateOrderStatusInputSchema)
    .mutation(({ input }) => updateOrderStatus(input)),

  // Categories
  getCategories: publicProcedure
    .query(() => getCategories()),

  createCategory: publicProcedure
    .input(z.object({ name: z.string(), description: z.string().nullable() }))
    .mutation(({ input }) => createCategory(input)),

  // Reports and moderation
  createReport: publicProcedure
    .input(createReportInputSchema)
    .mutation(({ input }) => createReport(input)),

  getReports: publicProcedure
    .query(() => getReports()),

  updateReportStatus: publicProcedure
    .input(z.object({ 
      reportId: z.number(), 
      status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed']) 
    }))
    .mutation(({ input }) => updateReportStatus(input.reportId, input.status)),

  // Admin actions
  deactivateUser: publicProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(({ input }) => deactivateUser(input.userId)),

  deactivateProduct: publicProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(({ input }) => deactivateProduct(input.productId)),

  getPlatformStats: publicProcedure
    .query(() => getPlatformStats()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
