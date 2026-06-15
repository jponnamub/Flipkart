import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-10">
      <div className="card w-full max-w-md p-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-600">Welcome back</p>
        <h1 className="mt-2 text-3xl font-black">Sign in</h1>
        <p className="mt-2 text-sm text-slate-500">
          Demo admin: admin@marketplace.local / Admin123!
        </p>
        <div className="mt-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-5 text-sm text-slate-500">
          New customer? <Link href="/register" className="font-bold text-blue-700">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
