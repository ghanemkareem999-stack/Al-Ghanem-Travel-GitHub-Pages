import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import type { PublicSiteSettings } from "@/lib/publicSiteSettings";
import { Loader2, Save, ShieldAlert } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const initialSettings: PublicSiteSettings = {
  homepageWelcomeEyebrow: "Al Ghanem Travel",
  homepageWelcomeTitle: "Accommodation for groups and religious-travel programmes.",
  homepageWelcomeBody: "Corporate accommodation and religious-travel programmes, coordinated through Al Ghanem Travel.",
  contactEmail: "alghanemtravel@gmail.com",
  primaryWhatsAppUrl: "https://wa.me/message/KQURHNYUTPXPK1",
  secondaryWhatsAppDisplay: "+20 10 42923435",
  secondaryWhatsAppUrl: "https://wa.me/201042923435",
  facebookUrl: "https://www.facebook.com/share/1BmzDcDGTK/",
  defaultSeoTitle: "Al Ghanem Travel | Islamic Tourism & Travel Services",
  defaultSeoDescription: "Corporate accommodation and religious-travel programmes for Madinah Al Munawwarah.",
};

function GeneralSettingsBody() {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const query = trpc.siteSettings.get.useQuery();
  const save = trpc.siteSettings.save.useMutation({ onSuccess: () => utils.siteSettings.get.invalidate() });
  const [settings, setSettings] = useState<PublicSiteSettings>(initialSettings);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (query.data) setSettings(query.data);
  }, [query.data]);

  if (loading) return null;
  if (!isAdmin) return <div className="mx-auto max-w-2xl rounded-2xl border border-amber-300 bg-amber-50 p-8 text-amber-950"><ShieldAlert className="mb-4" /><h1 className="text-2xl font-semibold">Administrator access required</h1><p className="mt-2 text-sm leading-6">General settings can only be managed by an authorised Al Ghanem Travel administrator.</p></div>;
  const update = (key: keyof PublicSiteSettings, value: string) => setSettings(current => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    try {
      await save.mutateAsync(settings);
      setMessage("General settings saved. Public contact channels and the English homepage default update immediately.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Settings could not be saved.");
    }
  };

  return <div className="mx-auto max-w-5xl space-y-8"><header><p className="text-xs font-semibold uppercase tracking-[.16em] text-amber-700">Al Ghanem Travel</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">General settings</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Manage public contact channels, the English homepage default, and baseline SEO without changing source code.</p></header>{message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{message}</div>}{query.isLoading ? <Loader2 className="animate-spin" /> : <form onSubmit={submit} className="grid gap-5 rounded-2xl border bg-card p-6 shadow-sm"><div><h2 className="text-xl font-semibold">Homepage default</h2><p className="mt-1 text-sm text-muted-foreground">The default English welcome content. Other language pages retain their reviewed translations.</p></div><label className="text-sm font-medium">Welcome eyebrow<Input className="mt-1" value={settings.homepageWelcomeEyebrow} onChange={event => update("homepageWelcomeEyebrow", event.target.value)} /></label><label className="text-sm font-medium">Welcome title<Input className="mt-1" value={settings.homepageWelcomeTitle} onChange={event => update("homepageWelcomeTitle", event.target.value)} /></label><label className="text-sm font-medium">Welcome body<Textarea className="mt-1 min-h-24" value={settings.homepageWelcomeBody} onChange={event => update("homepageWelcomeBody", event.target.value)} /></label><div className="border-t pt-5"><h2 className="text-xl font-semibold">Contact channels</h2><p className="mt-1 text-sm text-muted-foreground">These values control the visible email, WhatsApp, and Facebook links across the public shell.</p></div><div className="grid gap-5 md:grid-cols-2"><label className="text-sm font-medium">Business email<Input className="mt-1" type="email" value={settings.contactEmail} onChange={event => update("contactEmail", event.target.value)} /></label><label className="text-sm font-medium">Official WhatsApp URL<Input className="mt-1" type="url" value={settings.primaryWhatsAppUrl} onChange={event => update("primaryWhatsAppUrl", event.target.value)} /></label><label className="text-sm font-medium">Secondary WhatsApp display<Input className="mt-1" value={settings.secondaryWhatsAppDisplay} onChange={event => update("secondaryWhatsAppDisplay", event.target.value)} /></label><label className="text-sm font-medium">Secondary WhatsApp URL<Input className="mt-1" type="url" value={settings.secondaryWhatsAppUrl} onChange={event => update("secondaryWhatsAppUrl", event.target.value)} /></label><label className="text-sm font-medium md:col-span-2">Facebook page URL<Input className="mt-1" type="url" value={settings.facebookUrl} onChange={event => update("facebookUrl", event.target.value)} /></label></div><div className="border-t pt-5"><h2 className="text-xl font-semibold">Baseline SEO</h2><p className="mt-1 text-sm text-muted-foreground">Default metadata used as the site-wide English baseline. Hotel and locale-specific metadata remain independently managed.</p></div><label className="text-sm font-medium">Default SEO title<Input className="mt-1" value={settings.defaultSeoTitle} onChange={event => update("defaultSeoTitle", event.target.value)} /></label><label className="text-sm font-medium">Default SEO description<Textarea className="mt-1 min-h-24" value={settings.defaultSeoDescription} onChange={event => update("defaultSeoDescription", event.target.value)} /></label><div><Button type="submit" disabled={save.isPending} className="gap-2"><Save size={16} />{save.isPending ? "Saving…" : "Save general settings"}</Button></div></form>}</div>;
}

export default function GeneralSettingsAdmin() { return <DashboardLayout><GeneralSettingsBody /></DashboardLayout>; }
