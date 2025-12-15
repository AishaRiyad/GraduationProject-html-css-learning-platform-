import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GreenAuthLayout from "../../components/GreenAuthLayout";

const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function useQuery(){ const {search} = useLocation(); return useMemo(()=>new URLSearchParams(search),[search]); }

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
    let ignore = false;
    async function verify() {
      try {
        const res = await fetch(`${API}/api/auth/verify-reset-token/${token}`);
        if (!res.ok) {
          const d = await res.json().catch(()=>({}));
          if (!ignore) setStatus({ type: "err", msg: d?.message || "Link is invalid or expired." });
        } else if (!ignore) setValid(true);
      } catch {
        if (!ignore) setStatus({ type: "err", msg: "Could not verify token." });
      } finally { if (!ignore) setChecking(false); }
    }
    if (token) verify();
    else { setStatus({ type: "err", msg: "Invalid link." }); setChecking(false); setValid(false); }
    return ()=>{ ignore = true; };
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });
    if (password.length < 8) return setStatus({ type: "err", msg: "Password must be at least 8 characters." });
    if (password !== confirm) return setStatus({ type: "err", msg: "Passwords do not match." });
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ token, email: emailFromLink, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update password.");
      setStatus({ type:"ok", msg:"Password updated successfully. Redirecting…" });
      setTimeout(()=> nav("/login"), 1200); // ⬅️ يرجّع للّوجين الأصلي
    } catch (err) {
      setStatus({ type:"err", msg: err.message });
    }
  };

  return (
    <GreenAuthLayout>
      <div className="card">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
          <div className="w-20 h-20 grid place-items-center rounded-full bg-green-100 border border-green-200">
            <span className="text-3xl">🔒</span>
          </div>
        </div>

        <h1 className="title mt-8">Set a new password</h1>
        <p className="sub">Email: <span className="font-semibold">{emailFromLink || "—"}</span></p>

        {checking && <div className="alert alert-err mt-4">Verifying token…</div>}
        {status.msg && !checking && (
          <div className={`alert mt-4 ${status.type === "ok" ? "alert-ok" : "alert-err"}`}>{status.msg}</div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4" hidden={!valid || checking}>
          <label className="label" htmlFor="pass">New password</label>
          <input id="pass" type="password" className="input" placeholder="••••••••"
                 value={password} onChange={(e)=>setPassword(e.target.value)} />
          <label className="label" htmlFor="confirm">Confirm password</label>
          <input id="confirm" type="password" className="input" placeholder="••••••••"
                 value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
          <button className="btn-primary mt-2" type="submit">Change password</button>
        </form>
      </div>
    </GreenAuthLayout>
  );
}

