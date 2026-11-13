import { ReviewStatus } from "@prisma/client";
import { AdminShell } from "@/components/admin-shell";
import { adminModerateReview } from "@/lib/actions";
import { getAdminReviews } from "@/lib/admin";
import { RatingStars } from "@/components/rating-stars";

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();

  return (
    <AdminShell title="Review moderation">
      <section className="card p-6">
        <h2 className="text-2xl font-black">Reviews</h2>
        <div className="mt-4 grid gap-4">
          {reviews.map((review) => (
            <form key={review.id} action={adminModerateReview} className="rounded-2xl border border-slate-200 p-4">
              <input type="hidden" name="id" value={review.id} />
              <div className="grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-center">
                <div>
                  <RatingStars rating={review.rating} />
                  <p className="mt-2 text-lg font-black">{review.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
                  <p className="mt-2 text-xs font-bold text-slate-400">
                    {review.product.name} by {review.user.email}
                  </p>
                </div>
                <select className="input" name="status" defaultValue={review.status}>
                  {Object.values(ReviewStatus).map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <button className="btn-secondary" type="submit">Moderate</button>
              </div>
            </form>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
