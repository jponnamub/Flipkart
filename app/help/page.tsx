import { LifeBuoy, Mail, PackageSearch, RotateCcw, ShieldQuestion } from "lucide-react";

export default function HelpPage() {
  const cards = [
    { icon: PackageSearch, title: "Orders & tracking", text: "Find order status, tracking numbers, and delivery updates from your account." },
    { icon: RotateCcw, title: "Returns & refunds", text: "Admins can update refund and order statuses in the operations panel." },
    { icon: ShieldQuestion, title: "Payments", text: "Checkout uses Stripe test mode only for safe local and staging validation." },
    { icon: Mail, title: "Contact support", text: "This form is email-ready and can be connected to your transactional provider." }
  ];

  return (
    <section className="container-page py-8">
      <div className="card p-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-600">Help center</p>
        <h1 className="mt-2 text-3xl font-black md:text-5xl">How can we help?</h1>
        <p className="mt-3 max-w-2xl text-slate-500">
          Support content for customers, sellers, and marketplace operators. Add an email provider to send these requests.
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cards.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-6">
            <Icon className="text-blue-600" />
            <h2 className="mt-3 text-xl font-black">{title}</h2>
            <p className="mt-2 text-slate-500">{text}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <form className="card grid gap-4 p-6">
          <h2 className="text-2xl font-black">Contact us</h2>
          <input className="input" placeholder="Name" />
          <input className="input" type="email" placeholder="Email" />
          <select className="input" defaultValue="orders">
            <option value="orders">Orders</option>
            <option value="seller">Seller support</option>
            <option value="refund">Refund request</option>
            <option value="technical">Technical issue</option>
          </select>
          <textarea className="input min-h-32" placeholder="How can we help?" />
          <button className="btn-primary" type="button">
            <LifeBuoy size={18} /> Prepare support request
          </button>
        </form>
        <aside className="card p-6">
          <h2 className="text-2xl font-black">Local testing credentials</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            <p><strong>Admin:</strong> admin@marketplace.local / Admin123!</p>
            <p><strong>Seller:</strong> seller@marketplace.local / Seller123!</p>
            <p><strong>Customer:</strong> customer@marketplace.local / Customer123!</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
