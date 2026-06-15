# Northstar Market

A full-stack e-commerce marketplace built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, **Prisma ORM**, **NextAuth**, and **Stripe test checkout**. The UI is inspired by large modern marketplaces while using original branding, layout, content, and assets.

## Features

### Customer storefront

- Home, product listing, search results, category, deals, product detail, cart, checkout, login/register, profile, orders, order details, wishlist, and help/contact pages
- Product search across name, description, and brand
- Filters by price, rating, category, and brand
- Sorting by popularity, newest, and price
- Product recommendations by category
- Persistent authenticated cart and wishlist
- Stripe test-mode checkout only
- Order tracking, status timeline, and order history
- Reviews and ratings with admin moderation
- Fully responsive mobile/desktop UI

### Admin panel

- Admin dashboard with KPIs, revenue chart, recent orders, and low-stock alerts
- Product CRUD and inventory fields
- Category CRUD
- Inventory management
- Order management with status, payment/refund status, and tracking updates
- User management
- Seller management
- Coupon/discount management
- Review moderation
- Sales analytics and revenue charts

## Tech stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS 4
- PostgreSQL
- Prisma ORM
- NextAuth credentials authentication with Prisma adapter
- Stripe Checkout in test mode
- Local image upload endpoint at `/api/uploads` plus optional Cloudinary environment variables
- Recharts for admin analytics

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Set `DATABASE_URL` to a PostgreSQL database. Example:

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/marketplace?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-a-long-random-secret"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```

4. Generate Prisma Client and run migrations:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. Seed the database:

   ```bash
   npm run db:seed
   ```

6. Start development:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000).

## Local test credentials

- Admin: `admin@marketplace.local` / `Admin123!`
- Seller: `seller@marketplace.local` / `Seller123!`
- Customer: `customer@marketplace.local` / `Customer123!`

## Stripe test checkout

Checkout intentionally requires a Stripe **test-mode** secret key beginning with `sk_test_`. If the key is missing or not test-mode, checkout redirects back with a configuration error instead of simulating payment.

For local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Set the emitted webhook secret as `STRIPE_WEBHOOK_SECRET`.

## Image upload

Admins and sellers can upload images by POSTing multipart form data with a `file` field to `/api/uploads`. Files are stored under `public/uploads`. Cloudinary environment variables are included for deployments that prefer external media storage.

## Deployment: Vercel + Supabase/Neon PostgreSQL

1. Create a PostgreSQL project in Supabase or Neon.
2. Copy the pooled or direct connection string into Vercel as `DATABASE_URL`.
3. Add:
   - `NEXTAUTH_URL=https://your-domain.vercel.app`
   - `NEXTAUTH_SECRET=<long random secret>`
   - `NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app`
   - Stripe test keys and webhook secret
4. Deploy to Vercel.
5. Run migrations against the hosted database:

   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

6. Configure the Stripe webhook endpoint:

   ```text
   https://your-domain.vercel.app/api/stripe/webhook
   ```

## Useful scripts

```bash
npm run dev              # Start local dev server
npm run build            # Production build
npm run start            # Start built app
npm run test             # Lint and typecheck
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Create/apply local migration
npm run db:seed          # Seed sample data
npm run db:studio        # Open Prisma Studio
```

## Notes

- No Amazon branding, logos, protected assets, exact layout, or copied text are used.
- Payment state is updated by Stripe webhook events; the app does not fake successful payments.
- Notification records are stored in `NotificationLog` so an email provider can be connected without changing order workflows.
