import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveAddress, updateProfile } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/profile");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { addresses: true, sellerProfile: true }
  });

  if (!user) redirect("/login");

  return (
    <section className="container-page py-8">
      <h1 className="text-4xl font-black">Profile</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-2xl font-black">Account details</h2>
          <form action={updateProfile} className="mt-5 grid gap-4">
            <label className="grid gap-1 text-sm font-semibold">
              Name
              <input className="input" name="name" defaultValue={user.name ?? ""} />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Email
              <input className="input" value={user.email} disabled />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Phone
              <input className="input" name="phone" defaultValue={user.phone ?? ""} />
            </label>
            <button className="btn-primary" type="submit">
              Save profile
            </button>
          </form>
        </section>
        <section className="card p-6">
          <h2 className="text-2xl font-black">Addresses</h2>
          <div className="mt-4 grid gap-3">
            {user.addresses.map((address) => (
              <div key={address.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-black">{address.label}</p>
                <p className="text-sm text-slate-500">
                  {address.line1}, {address.city}, {address.state} {address.postalCode}
                </p>
              </div>
            ))}
          </div>
          <form action={saveAddress} className="mt-5 grid gap-3 md:grid-cols-2">
            <input className="input" name="label" placeholder="Label" defaultValue="Home" />
            <input className="input" name="line1" placeholder="Address line 1" required />
            <input className="input" name="line2" placeholder="Address line 2" />
            <input className="input" name="city" placeholder="City" required />
            <input className="input" name="state" placeholder="State" required />
            <input className="input" name="postalCode" placeholder="Postal code" required />
            <input className="input" name="country" placeholder="Country" defaultValue="US" />
            <button className="btn-secondary" type="submit">
              Add address
            </button>
          </form>
        </section>
      </div>
    </section>
  );
}
