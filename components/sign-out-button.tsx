"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </button>
  );
}
