import { Role } from "@prisma/client";
import { AdminShell } from "@/components/admin-shell";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      _count: { select: { orders: true, reviews: true } },
      sellerProfile: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AdminShell title="User management">
      <section className="card p-6">
        <h2 className="text-2xl font-black">Users</h2>
        <div className="table-wrap mt-4">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Orders</th>
                <th>Reviews</th>
                <th>Seller store</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100">
                  <td className="py-3 font-bold">{user.name ?? "Unnamed"}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={user.role === Role.ADMIN ? "font-black text-blue-700" : "font-semibold"}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user._count.orders}</td>
                  <td>{user._count.reviews}</td>
                  <td>{user.sellerProfile?.storeName ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
