import type { Metadata } from "next";
import Link from "next/link";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Northstar Market | Modern Marketplace",
  description:
    "A full-stack marketplace with search, checkout, orders, reviews, admin operations, analytics, and seller management."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <footer className="mt-16 border-t border-slate-200 bg-slate-950 text-white">
            <div className="container-page grid gap-8 py-10 md:grid-cols-4">
              <div>
                <p className="text-lg font-black">Northstar Market</p>
                <p className="mt-3 text-sm text-slate-300">
                  A modern marketplace demo with original branding, Stripe test checkout, and a complete admin surface.
                </p>
              </div>
              <div>
                <p className="font-bold">Shop</p>
                <div className="mt-3 grid gap-2 text-sm text-slate-300">
                  <Link href="/products">All products</Link>
                  <Link href="/deals">Deals</Link>
                  <Link href="/wishlist">Wishlist</Link>
                </div>
              </div>
              <div>
                <p className="font-bold">Account</p>
                <div className="mt-3 grid gap-2 text-sm text-slate-300">
                  <Link href="/profile">Profile</Link>
                  <Link href="/orders">Orders</Link>
                  <Link href="/cart">Cart</Link>
                </div>
              </div>
              <div>
                <p className="font-bold">Support</p>
                <div className="mt-3 grid gap-2 text-sm text-slate-300">
                  <Link href="/help">Help center</Link>
                  <Link href="/admin">Admin dashboard</Link>
                </div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
