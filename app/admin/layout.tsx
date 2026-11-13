import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, canAccessAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canAccessAdmin(session.user.role)) {
    redirect("/login?callbackUrl=/admin");
  }

  return children;
}
