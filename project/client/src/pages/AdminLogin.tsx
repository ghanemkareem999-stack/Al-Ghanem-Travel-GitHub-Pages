import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/local/login", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ email, password }) });
      if (!response.ok) throw new Error("The email or password was not accepted.");
      setLocation("/admin/hotels");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-in could not be completed.");
    } finally {
      setSubmitting(false);
    }
  };
  return <main className="grid min-h-screen place-items-center bg-[#f4f0e6] p-5"><form onSubmit={submit} className="w-full max-w-md rounded-[1.5rem] border border-[#173e35]/10 bg-white p-7 shadow-xl"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#a9853d]">Al Ghanem Travel</p><h1 className="mt-3 font-serif text-3xl text-[#173e35]">Administrator sign in</h1><p className="mt-3 text-sm leading-6 text-[#557068]">Use the external administrator credentials configured for this deployment.</p>{message && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">{message}</p>}<label className="mt-6 block text-sm font-semibold text-[#173e35]">Email<Input type="email" required value={email} onChange={event => setEmail(event.target.value)} className="mt-2" autoComplete="email" /></label><label className="mt-5 block text-sm font-semibold text-[#173e35]">Password<Input type="password" required value={password} onChange={event => setPassword(event.target.value)} className="mt-2" autoComplete="current-password" /></label><Button type="submit" disabled={submitting} className="mt-6 w-full">{submitting ? "Signing in…" : "Sign in"}</Button></form></main>;
}
