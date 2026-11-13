import Link from "next/link";
import { ReactNode } from "react";

const adminLinks = [
  ["Dashboard", "/admin"],
  ["Products", "/admin/products"],
  ["Categories", "/admin/categories"],
  ["Inventory", "/admin/inventory"],
  ["Orders", "/admin/orders"],
  ["Users", "/admin/users"],
  ["Sellers", "/admin/sellers"],
  ["Coupons", "/admin/coupons"],
  ["Reviews", "/admin/reviews"],
  ["Analytics", "/admin/analytics"]
];

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="container-page py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-600">Admin</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
        </div>
      </div>
      <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
        {adminLinks.map(([label, href]) => (
          <Link key={href} href={href} className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700">
            {label}
          </Link>
        ))}
      </div>
      {children}
    </section>
  );
}
