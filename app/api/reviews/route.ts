import { NextRequest, NextResponse } from "next/server";
import { loadReviews, saveReviews, Review } from "@/lib/reviews";
import { requireAdmin } from "@/lib/require-admin";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  const upc = req.nextUrl.searchParams.get("upc");
  const reviews = loadReviews();
  if (upc) return NextResponse.json(reviews.filter((r) => r.upc === upc && r.approved));
  // Admin: all reviews
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return NextResponse.json(reviews.filter((r) => r.approved));
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  // Must be logged in as customer
  const session = await getServerSession();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Login required to leave a review" }, { status: 401 });

  const body = await req.json();
  const { upc, rating, title, body: reviewBody } = body;

  if (!upc || !rating || !title || !reviewBody)
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  if (rating < 1 || rating > 5)
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });

  const reviews = loadReviews();

  // One review per user per product
  if (reviews.some((r) => r.upc === upc && r.userId === session.user?.email))
    return NextResponse.json({ error: "You already reviewed this product" }, { status: 409 });

  const review: Review = {
    id:        crypto.randomUUID(),
    upc,
    userId:    session.user.email,
    userName:  session.user.name ?? "Customer",
    rating:    Number(rating),
    title:     title.trim().slice(0, 100),
    body:      reviewBody.trim().slice(0, 1000),
    createdAt: new Date().toISOString(),
    approved:  false, // admin must approve
  };

  reviews.push(review);
  saveReviews(reviews);
  return NextResponse.json({ ok: true, review }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id, approved } = await req.json();
  const reviews = loadReviews().map((r) => r.id === id ? { ...r, approved } : r);
  saveReviews(reviews);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await req.json();
  saveReviews(loadReviews().filter((r) => r.id !== id));
  return NextResponse.json({ ok: true });
}
