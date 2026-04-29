import { loadReviews } from "@/lib/reviews";
import ReviewsClient from "./ReviewsClient";

export const dynamic = "force-dynamic";

export default function ReviewsPage() {
  const reviews = loadReviews().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return <ReviewsClient reviews={reviews} />;
}
