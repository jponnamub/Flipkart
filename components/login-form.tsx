"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setError("");
        startTransition(async () => {
          const result = await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false
          });

          if (result?.error) {
            setError("Invalid email or password.");
            return;
          }

          router.push(searchParams.get("callbackUrl") || "/profile");
          router.refresh();
        });
      }}
    >
      <label className="grid gap-1 text-sm font-semibold">
        Email
        <input className="input" name="email" type="email" required />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Password
        <input className="input" name="password" type="password" required />
      </label>
      {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      <button className="btn-primary" type="submit" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
