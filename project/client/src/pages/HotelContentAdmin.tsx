import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, FileUp, Loader2, Pencil, ShieldAlert, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const initialForm = { slug: "", name: "", address: "", shortDescription: "", longDescription: "", officialWebsiteUrl: "", googleMapsPlaceUrl: "", sourceNote: "", editorialNote: "", category: "executive" as "premium" | "executive" | "value", sourceStatus: "official" as "planning" | "official" | "partner_verified", directoryZone: "central_north", accessMode: "walkable" as "walkable" | "transfer_advised", portfolioStatus: "draft" as "draft" | "verified" | "published", latitude: "", longitude: "", locationVerifiedAt: "", routeVerifiedAt: "", nearestGateName: "", nearestGateAddress: "", nearestGateMapsUrl: "" };

function HotelContentAdminBody() {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const records = trpc.catalogue.list.useQuery(undefined, { enabled: isAdmin });
  const save = trpc.catalogue.saveDraft.useMutation({ onSuccess: () => { utils.catalogue.list.invalidate(); utils.catalogue.published.invalidate(); } });
  const upload = trpc.catalogue.uploadAuthorizedImage.useMutation({ onSuccess: () => { utils.catalogue.list.invalidate(); utils.catalogue.published.invalidate(); } });
  const remove = trpc.catalogue.remove.useMutation({ onSuccess: () => { utils.catalogue.list.invalidate(); utils.catalogue.published.invalidate(); setSelectedHotelId(""); setForm(initialForm); } });
  const removeImage = trpc.catalogue.removeImage.useMutation({ onSuccess: () => { utils.catalogue.get.invalidate(); utils.catalogue.list.invalidate(); utils.catalogue.published.invalidate(); } });
  const [form, setForm] = useState(initialForm);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const selectedRecord = trpc.catalogue.get.useQuery({ hotelId: Number(selectedHotelId) }, { enabled: isAdmin && Boolean(selectedHotelId) });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const dateValue = (value: Date | string | null | undefined) => value ? new Date(value).toISOString().slice(0, 10) : "";

  useEffect(() => {
    const record = selectedRecord.data;
    if (!record) return;
    const english = record.translations.find(item => item.locale === "en");
    setForm({ slug: record.slug, name: english?.name || "", address: english?.address || "", shortDescription: english?.shortDescription || "", longDescription: english?.longDescription || "", officialWebsiteUrl: record.officialWebsiteUrl || "", googleMapsPlaceUrl: record.googleMapsPlaceUrl || "", sourceNote: record.sourceNote || "", editorialNote: "Updated through the protected owner workspace.", category: record.category, sourceStatus: record.sourceStatus, directoryZone: record.directoryZone || "central_north", accessMode: record.accessMode || "walkable", portfolioStatus: record.portfolioStatus, latitude: record.latitude?.toString() || "", longitude: record.longitude?.toString() || "", locationVerifiedAt: dateValue(record.locationVerifiedAt), routeVerifiedAt: dateValue(record.routeVerifiedAt), nearestGateName: record.nearestGateName || "", nearestGateAddress: record.nearestGateAddress || "", nearestGateMapsUrl: record.nearestGateMapsUrl || "" });
  }, [selectedRecord.data]);

  if (loading) return null;
  if (!isAdmin) return <div className="mx-auto max-w-2xl rounded-2xl border border-amber-300 bg-amber-50 p-8 text-amber-950"><ShieldAlert className="mb-4" /><h1 className="text-2xl font-semibold">Administrator access required</h1><p className="mt-2 text-sm leading-6">Hotel records, routes, and imagery can only be managed by an authorised Al Ghanem Travel administrator.</p></div>;

  const change = (key: keyof typeof initialForm, value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    try {
      await save.mutateAsync({ city: { slug: "madinah", launchStatus: "active" }, hotel: { slug: form.slug, category: form.category, officialWebsiteUrl: form.officialWebsiteUrl || undefined, googleMapsPlaceUrl: form.googleMapsPlaceUrl || undefined, latitude: form.latitude ? Number(form.latitude) : undefined, longitude: form.longitude ? Number(form.longitude) : undefined, directoryZone: form.directoryZone as "central_north", sourceStatus: form.sourceStatus, sourceNote: form.sourceNote || undefined, accessMode: form.accessMode, locationVerifiedAt: form.locationVerifiedAt || undefined, routeVerifiedAt: form.routeVerifiedAt || undefined, nearestGateName: form.nearestGateName || undefined, nearestGateAddress: form.nearestGateAddress || undefined, nearestGateMapsUrl: form.nearestGateMapsUrl || undefined, portfolioStatus: form.portfolioStatus, corporateReady: false }, translations: [{ locale: "en", name: form.name, shortDescription: form.shortDescription, longDescription: form.longDescription, address: form.address }], editorialNote: form.editorialNote });
      setMessage(form.portfolioStatus === "published" ? "Hotel record published to the public directory. Only its saved location fields and managed media are shown." : "Hotel record saved in the protected workspace and remains non-public until published.");
      setForm(initialForm);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The hotel record could not be saved.");
    }
  };
  const submitImage = async () => {
    if (!imageFile || !selectedHotelId) return;
    setMessage("");
    try {
      const data = await imageFile.arrayBuffer();
      const base64 = btoa(Array.from(new Uint8Array(data), byte => String.fromCharCode(byte)).join(""));
      await upload.mutateAsync({ hotelId: Number(selectedHotelId), fileName: imageFile.name, contentType: imageFile.type as "image/webp" | "image/jpeg" | "image/png", base64, altText: `${imageFile.name} — hotel media` });
      setMessage("Image saved to managed storage.");
      setImageFile(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The image could not be saved.");
    }
  };
  const deleteSelected = async (id: number, slug: string) => {
    if (!window.confirm(`Remove ${slug}? This removes its dashboard translations and gallery records from the database.`)) return;
    setMessage("");
    try {
      await remove.mutateAsync({ hotelId: id, confirmationSlug: slug });
      setMessage(`${slug} was removed from the controlled directory.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The hotel record could not be removed.");
    }
  };
  const deleteImage = async (id: number) => {
    if (!window.confirm("Remove this image from the hotel gallery? The storage object is retained but will no longer be shown or referenced by this hotel.")) return;
    setMessage("");
    try {
      await removeImage.mutateAsync({ imageId: id });
      setMessage("Image removed from the hotel gallery.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The image could not be removed.");
    }
  };
  const fieldClass = "mt-1 h-10";

  return <div className="mx-auto max-w-6xl space-y-8">
    <header><p className="text-xs font-semibold uppercase tracking-[.16em] text-amber-700">Al Ghanem Travel</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Hotel content workspace</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Create, edit, remove, and publish hotel records. Images are saved to managed storage, not a public project folder, so they remain available after deployment.</p></header>
    {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{message}</div>}
    <form onSubmit={submit} className="grid gap-5 rounded-2xl border bg-card p-6 shadow-sm md:grid-cols-2">
      <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">{selectedHotelId ? `Edit hotel: ${form.slug}` : "Create a hotel record"}</h2>{selectedHotelId && <Button type="button" variant="outline" onClick={() => { setSelectedHotelId(""); setForm(initialForm); }}>Start a new record</Button>}</div>
      {([['slug','Slug'],['name','English hotel name'],['address','English address'],['officialWebsiteUrl','Official website URL'],['googleMapsPlaceUrl','Google Maps URL'],['latitude','Latitude'],['longitude','Longitude'],['locationVerifiedAt','Location review date'],['routeVerifiedAt','Gate-route review date'],['nearestGateName','Nearest practical gate'],['nearestGateAddress','Nearest gate address'],['nearestGateMapsUrl','Nearest gate Maps URL']] as const).map(([key, label]) => <label key={key} className="text-sm font-medium">{label}<Input required={['slug','name','address'].includes(key)} type={key.endsWith('At') ? 'date' : 'text'} value={form[key]} onChange={event => change(key, event.target.value)} className={fieldClass} /></label>)}
      <label className="text-sm font-medium">Category<select value={form.category} onChange={event => change('category', event.target.value)} className={`${fieldClass} w-full rounded-md border bg-background px-3`}><option value="premium">Premium</option><option value="executive">Executive</option><option value="value">Value</option></select></label>
      <label className="text-sm font-medium">Evidence level<select value={form.sourceStatus} onChange={event => change('sourceStatus', event.target.value)} className={`${fieldClass} w-full rounded-md border bg-background px-3`}><option value="planning">Planning</option><option value="official">Official source</option><option value="partner_verified">Partner verified</option></select></label>
      <label className="text-sm font-medium">District zone<select value={form.directoryZone} onChange={event => change('directoryZone', event.target.value)} className={`${fieldClass} w-full rounded-md border bg-background px-3`}><option value="central_north">Central North</option><option value="central_east">Central East</option><option value="central_south">Central South</option><option value="central_west">Central West</option><option value="northern_transfer">North / King Fahd Road</option><option value="other_districts">Other Madinah district</option></select></label>
      <label className="text-sm font-medium">Access arrangement<select value={form.accessMode} onChange={event => change('accessMode', event.target.value)} className={`${fieldClass} w-full rounded-md border bg-background px-3`}><option value="walkable">Central access</option><option value="transfer_advised">Transfer advised</option></select></label>
      <label className="text-sm font-medium">Publication state<select value={form.portfolioStatus} onChange={event => change('portfolioStatus', event.target.value)} className={`${fieldClass} w-full rounded-md border bg-background px-3`}><option value="draft">Draft — private</option><option value="verified">Verified — private</option><option value="published">Published — public directory</option></select></label>
      <label className="text-sm font-medium">Short public description<Textarea required value={form.shortDescription} onChange={event => change('shortDescription', event.target.value)} className="mt-1 min-h-24" /></label>
      <label className="text-sm font-medium">Long public description<Textarea required value={form.longDescription} onChange={event => change('longDescription', event.target.value)} className="mt-1 min-h-24" /></label>
      <label className="md:col-span-2 text-sm font-medium">Source and verification note — internal only<Textarea value={form.sourceNote} onChange={event => change('sourceNote', event.target.value)} className="mt-1 min-h-20" /></label>
      <label className="md:col-span-2 text-sm font-medium">Editorial note — internal only<Textarea required value={form.editorialNote} onChange={event => change('editorialNote', event.target.value)} className="mt-1 min-h-20" /></label>
      <div className="md:col-span-2"><Button disabled={save.isPending} type="submit" className="gap-2"><CheckCircle2 size={16} />{save.isPending ? 'Saving…' : selectedHotelId ? 'Save hotel changes' : 'Save hotel record'}</Button></div>
    </form>
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Image upload</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">Hotel record<select value={selectedHotelId} onChange={event => setSelectedHotelId(event.target.value)} className={`${fieldClass} w-full rounded-md border bg-background px-3`}><option value="">Choose a saved hotel</option>{records.data?.map(record => <option value={record.id} key={record.id}>{record.slug} · {record.portfolioStatus}</option>)}</select></label>
        <label className="text-sm font-medium">Image file<Input type="file" accept="image/webp,image/jpeg,image/png" onChange={event => setImageFile(event.target.files?.[0] || null)} className={fieldClass} /></label>
        <div className="md:col-span-2"><Button type="button" disabled={!selectedHotelId || !imageFile || upload.isPending} onClick={submitImage} className="gap-2"><FileUp size={16} />{upload.isPending ? 'Uploading…' : 'Upload Image'}</Button></div>
      </div>
      {selectedRecord.data?.gallery.length ? <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">{selectedRecord.data.gallery.map(image => <article key={image.id} className="rounded-xl border p-2 text-xs text-muted-foreground"><a href={image.imageUrl} target="_blank" rel="noreferrer"><img src={image.imageUrl} alt={image.altText || "Hotel media"} className="aspect-[4/3] w-full rounded-lg object-cover" /></a><div className="mt-2 flex items-center justify-between gap-2"><span className="truncate">{image.reviewStatus}</span><Button type="button" variant="ghost" size="icon" aria-label="Remove image" disabled={removeImage.isPending} onClick={() => deleteImage(image.id)} className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 size={14} /></Button></div></article>)}</div> : null}
    </section>
    <section className="rounded-2xl border bg-card p-6 shadow-sm"><h2 className="text-xl font-semibold">Controlled hotel records</h2>{records.isLoading ? <Loader2 className="mt-5 animate-spin" /> : <div className="mt-5 grid gap-3">{records.data?.map(record => <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-sm" key={record.id}><div><p className="font-semibold">{record.slug}</p><p className="mt-1 text-muted-foreground">{record.citySlug} · {record.sourceStatus} · {record.portfolioStatus}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">Updated {new Date(record.updatedAt).toLocaleDateString()}</span><Button type="button" size="sm" variant="outline" onClick={() => setSelectedHotelId(String(record.id))} className="gap-1"><Pencil size={14} />Edit</Button><Button type="button" size="sm" variant="destructive" disabled={remove.isPending} onClick={() => deleteSelected(record.id, record.slug)} className="gap-1"><Trash2 size={14} />Remove</Button></div></div>)}{records.data?.length === 0 && <p className="text-sm text-muted-foreground">No controlled hotel records have been created yet.</p>}</div>}</section>
  </div>;
}

export default function HotelContentAdmin() { return <DashboardLayout><HotelContentAdminBody /></DashboardLayout>; }
