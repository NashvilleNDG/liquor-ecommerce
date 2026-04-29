"use client";

import { useState } from "react";
import { Star, Check, X, MessageSquare, Clock } from "lucide-react";
import type { Review } from "@/lib/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className={i < rating ? "text-amber-400 fill-amber-400" : "text-stone-200 fill-stone-200"} />
      ))}
    </span>
  );
}

export default function ReviewsClient({ reviews: initial }: { reviews: Review[] }) {
  const [reviews, setReviews] = useState(initial);
  const [filter, setFilter]   = useState<"all" | "pending" | "approved">("all");

  const shown = reviews.filter((r) =>
    filter === "all" ? true : filter === "pending" ? !r.approved : r.approved
  );

  async function approve(id: string) {
    await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved: true }),
    });
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, approved: true } : r));
  }

  async function reject(id: string) {
    await fetch("/api/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  const pending  = reviews.filter((r) => !r.approved).length;
  const approved = reviews.filter((r) => r.approved).length;

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-amber-50 rounded-xl p-2">
          <MessageSquare size={20} className="text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900">Product Reviews</h1>
          <p className="text-sm text-stone-500">{pending} pending approval · {approved} published</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === f ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "pending" && pending > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {shown.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
          <MessageSquare size={36} className="text-stone-200 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">No reviews here yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((r) => (
            <div key={r.id} className={`bg-white border rounded-2xl p-5 ${r.approved ? "border-stone-200" : "border-amber-200 bg-amber-50/30"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Stars rating={r.rating} />
                    <span className="text-sm font-bold text-stone-900">{r.title}</span>
                    {!r.approved && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <Clock size={10} /> Pending
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed">{r.body}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                    <span>{r.userName}</span>
                    <span>·</span>
                    <span>UPC: {r.upc}</span>
                    <span>·</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!r.approved && (
                    <button
                      onClick={() => approve(r.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      <Check size={12} /> Approve
                    </button>
                  )}
                  <button
                    onClick={() => reject(r.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-stone-600 text-xs font-bold rounded-lg transition-colors"
                  >
                    <X size={12} /> {r.approved ? "Remove" : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
