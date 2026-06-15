import Link from "next/link";
import { registerUser } from "@/lib/actions";

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-10">
      <div className="card w-full max-w-md p-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-600">Create account</p>
        <h1 className="mt-2 text-3xl font-black">Register</h1>
        {params.error ? (
          <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {params.error === "exists" ? "An account with this email already exists." : "Enter a valid name, email, and 8+ character password."}
          </p>
        ) : null}
        <form action={registerUser} className="mt-6 grid gap-4">
          <label className="grid gap-1 text-sm font-semibold">
            Name
            <input className="input" name="name" required />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Email
            <input className="input" name="email" type="email" required />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Password
            <input className="input" name="password" type="password" minLength={8} required />
          </label>
          <button className="btn-primary" type="submit">
            Create account
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-500">
          Already registered? <Link href="/login" className="font-bold text-blue-700">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
