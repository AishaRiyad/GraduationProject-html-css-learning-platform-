import React, { useState } from "react";
import AuthCard from "../../components/StudentComponents/AuthCard";

const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!email) return setMsg("Please enter your email.");

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Something went wrong");
      setMsg("If the email exists, a reset link has been sent.");
      setEmail("");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Forgot your password?"
      altLinkText="Sign In"
      altLinkHref="/login"
      imageSrc="/flowers.png"
    >
      {msg && (
        <div className="text-sm rounded-xl p-3 border mt-1 bg-emerald-50 text-emerald-700 border-emerald-200">
          {msg}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4 mt-4">
        <div>
          <label className="text-xs text-gray-500">E-mail</label>
          <input
            type="email"
            className="mt-1 block w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full py-3 shadow" disabled={loading}>
          {loading ? "Sending…" : "RESET PASSWORD"}
        </button>
      </form>
    </AuthCard>
  );
}
