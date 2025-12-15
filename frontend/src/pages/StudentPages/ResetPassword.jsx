import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../../components/StudentComponents/AuthCard";

const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";
function useQuery(){ const {search}=useLocation(); return useMemo(()=>new URLSearchParams(search),[search]); }

export default function ResetPassword() {
  const q = useQuery();
  const token = (q.get("token") || "").trim();
  const emailFromLink = decodeURIComponent(q.get("email") || "");
  const nav = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [valid, setValid] = useState(false);
  const [checking, setChecking] = useState(!!token);

  useEffect(() => {
    let off = false;
    async function verify() {
      try {
        const r = await fetch(`${API}/api/auth/verify-reset-token/${token}`);
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          if (!off) setStatus({ type: "err", msg: d?.message || "Link is invalid or expired." });
        } else if (!off) setValid(true);
      } catch {
        if (!off) setStatus({ type: "err", msg: "Could not verify token." });
      } finally {
        if (!off) setChecking(false);
      }
    }
    if (token) verify();
    else {
      setStatus({ type: "err", msg: "Invalid link." });
      setChecking(false);
      setValid(false);
    }
    return () => { off = true; };
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });
    if (password.length < 8) return setStatus({ type: "err", msg: "Password must be at least 8 characters." });
    if (password !== confirm) return setStatus({ type: "err", msg: "Passwords do not match." });

    try {
      const r = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email: emailFromLink, password }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d?.message || "Failed to update password.");
      setStatus({ type: "ok", msg: "Password updated successfully. Redirecting…" });
      setTimeout(() => nav("/login"), 1200); // رجوع للّوجين
    } catch (err) {
      setStatus({ type: "err", msg: err.message });
    }
  };

  return (
    <AuthCard
      title="Set a new password"
      altLinkText="Sign In"
      altLinkHref="/login"
      imageSrc="/flowers.png"
    >
      <p className="text-sm text-gray-500 text-center -mt-2 mb-2">
        Email: <span className="font-semibold">{emailFromLink || "—"}</span>
      </p>

      {checking && <div className="text-sm text-gray-600 mt-2">Verifying link…</div>}
      {status.msg && !checking && (
        <div
          className={`text-sm rounded-xl p-3 border mt-2 ${
            status.type === "ok"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {status.msg}
        </div>
      )}

      {/* تحت بعض (مرتب) */}
      <form onSubmit={submit} className="space-y-4 mt-4" hidden={!valid || checking}>
        <div>
          <label className="text-xs text-gray-500">New password</label>
          <input
            type="password"
            className="mt-1 block w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Confirm password</label>
          <input
            type="password"
            className="mt-1 block w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full py-3 shadow">
          Change password
        </button>
      </form>
    </AuthCard>
  );
}
