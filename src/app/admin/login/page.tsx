"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Sparkles, User } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setErrorMsg(data.error || "Invalid credentials. Access denied.");
      }
    } catch (err) {
      setErrorMsg("Network error trying to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-inverse-surface text-white flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-md w-full space-y-8 shadow-elevated">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold mx-auto">
            <Sparkles className="w-6 h-6 fill-gold/20" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white">ETERNITY PRODUCTS</h1>
          <p className="text-xs text-neutral-400 font-light">Authorized Staff Operations & Vault Access</p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-semibold text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-neutral-400 mb-1">Username / Authorized Phone</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Enter username or phone"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 pl-10 text-white placeholder-neutral-600 focus:outline-none focus:border-gold transition-all"
              />
              <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-400 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 pl-10 text-white placeholder-neutral-600 focus:outline-none focus:border-gold transition-all"
              />
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs shadow-gold transition-all mt-4"
          >
            {loading ? "Verifying Credentials..." : "Sign In to Admin Operations"}
          </button>
        </form>
      </div>
    </div>
  );
}
