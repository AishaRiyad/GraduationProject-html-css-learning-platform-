import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "../../components/StudentComponents/AuthCard";
import { resetSocket, getSocket } from "../../socket";


const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}


export default function Login({ setCurrentUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.email || !form.password) {
      setError("Please fill out all fields.");
      setLoading(false);
      return;
    }

    try {
      
      const res = await axios.post(`${API}/api/auth/login`, form);
 const token = res.data?.token;
      if (!token) {
        setError("Login response missing token.");
        return;
      }

    
      localStorage.setItem("token", res.data.token);
      resetSocket();
getSocket();

      if (res.data?.role != null) localStorage.setItem("role", res.data.user.role);

      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
     
      const payload = decodeJwt(token);
      const userId =
        payload?.id ??
        payload?.user_id ??
        payload?.sub ??
        null;

     
      localStorage.setItem("tryit_ns", userId ? `u_${userId}` : "guest");

     
const user = res.data.user;
localStorage.setItem("user", JSON.stringify(user));
localStorage.setItem("userId", user.id);
localStorage.setItem("userName", user.full_name || user.name);
localStorage.setItem("userEmail", user.email);
localStorage.setItem("userPhoto", user.profile_image || "/user-avatar.jpg");


     
      setCurrentUser(res.data.user);
window.alert("✅ Login successful!");

const role = res.data.user.role;

if (role === "supervisor") {
  navigate("/supervisor-dashboard");
  return;
}
else if (role === "admin") {
  navigate("/admin");
  return;
}
      
      navigate("/dashboard");

    } catch (err) {
      console.error("LOGIN_ERROR:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      const apiMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (Array.isArray(err.response?.data?.errors) && err.response.data.errors.join(", ")) ||
        null;

      if (err.code === "ERR_NETWORK") {
        setError("Network error: تأكدي أن السيرفر شغّال وأن عنوان API صحيح.");
      } else if (err.response?.status === 401) {
        setError(apiMsg || "Wrong email or password.");
      } else if (err.response?.status === 400 || err.response?.status === 422) {
        setError(apiMsg || "Invalid input.");
      } else if (err.response?.status) {
        setError(apiMsg || `Server error (${err.response.status}).`);
      } else {
        setError(apiMsg || "An unexpected error occurred while signing in.");
      }
    }
 finally {
      setLoading(false);
    }
  }
 
    
  

  return (
    <AuthCard
      title="SIGN IN"
      altLinkText="Sign Up"
      altLinkHref="/signup"
      imageSrc="/flowers.png"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-red-600">{error}</div>}

        <div>
          <label className="text-xs text-gray-500">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="********"
            disabled={loading}
          />
          <div className="text-right mt-1">
            <Link
              to="/forgot-password"
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className={`mt-2 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full py-3 shadow ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </AuthCard>
  );
}
