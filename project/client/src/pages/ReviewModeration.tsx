import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Check, Loader2, ShieldAlert, X } from "lucide-react";
import { useState } from "react";

function ReviewModerationContent() {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const pending = trpc.reviews.pending.useQuery(undefined, { enabled: isAdmin });
  const moderate = trpc.reviews.moderate.useMutation({
    onSuccess: () => utils.reviews.pending.invalidate(),
  });
  const [notes, setNotes] = useState<Record<number, string>>({});

  if (loading) return null;
  if (!isAdmin) return <div className="mx-auto max-w-2xl rounded-2xl border border-amber-300 bg-amber-50 p-8 text-amber-950"><ShieldAlert className="mb-4" /><h1 className="text-2xl font-semibold">Administrator access required</h1><p className="mt-2 text-sm leading-6">Customer review data is available only to an authorised Al Ghanem Travel administrator.</p></div>;
  if (pending.isLoading) return <div className="grid min-h-64 place-items-center"><Loader2 className="animate-spin" /></div>;

  const decide = (reviewId: number, moderationStatus: "approved" | "rejected") => moderate.mutate({ reviewId, moderationStatus, moderationNote: notes[reviewId] || undefined });

  return <div className="mx-auto max-w-6xl space-y-8"><header><p className="text-xs font-semibold uppercase tracking-[.16em] text-amber-700">Al Ghanem Travel</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Customer review moderation</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Each submission remains private until you have verified it and decided whether it may be published. Company identity must remain hidden unless the submitter granted display permission.</p></header>{pending.data?.length ? <div className="grid gap-5">{pending.data.map(review => <article key={review.id} className="rounded-2xl border bg-card p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">{review.companyName}</h2><p className="mt-1 text-sm text-muted-foreground">{review.contactName} · {review.email}{review.phone ? ` · ${review.phone}` : ""}</p></div><div className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">{review.rating}/5</div></div><dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">Service</dt><dd className="mt-1 font-medium">{review.serviceType || "Not supplied"}</dd></div><div><dt className="text-muted-foreground">Publication identity</dt><dd className="mt-1 font-medium">{review.displayCompanyName ? "Company name permitted" : "Keep company name anonymous"}</dd></div><div><dt className="text-muted-foreground">Language</dt><dd className="mt-1 font-medium">{review.locale}</dd></div><div><dt className="text-muted-foreground">Submitted</dt><dd className="mt-1 font-medium">{new Date(review.createdAt).toLocaleString()}</dd></div></dl><blockquote className="mt-5 border-l-4 border-amber-400 pl-4 text-sm leading-7 text-foreground">{review.reviewBody}</blockquote><label className="mt-6 block text-sm font-medium">Internal moderation note<Textarea value={notes[review.id] ?? ""} onChange={event => setNotes(current => ({ ...current, [review.id]: event.target.value }))} className="mt-2 min-h-24" maxLength={1000} placeholder="Record verification or rejection context. This note is never published." /></label><div className="mt-5 flex flex-wrap gap-3"><Button onClick={() => decide(review.id, "approved")} disabled={moderate.isPending} className="gap-2"><Check size={16} />Approve for public display</Button><Button onClick={() => decide(review.id, "rejected")} disabled={moderate.isPending} variant="outline" className="gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"><X size={16} />Reject submission</Button></div></article>)}</div> : <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">There are no customer reviews awaiting moderation.</div>}</div>;
}

export default function ReviewModeration() {
  return <DashboardLayout><ReviewModerationContent /></DashboardLayout>;
}
