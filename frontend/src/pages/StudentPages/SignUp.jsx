// pages/Signup.jsx
import React, { useState } from "react";
import AuthCard from "../../components/StudentComponents/AuthCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: ""
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill out all fields.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Password and confirmation do not match.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "student"
      });

      alert(res.data.message || "Account created successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong.");
    }
  }

  return (
    <AuthCard
  title={<span className="uppercase">Sign Up</span>}
  imageSrc="/flowers.png"
  altLinkText="Sign In"
  altLinkHref="/login"
>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-red-600">{error}</div>}

        <div>
          <label className="text-xs text-gray-500">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="Your Name"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="you@example.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              placeholder="********"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Confirm Password</label>
            <input
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              placeholder="********"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-full py-2 shadow"
        >
          Sign Up
        </button>

        {/* هنا حطينا رابط Sign In تحت الزر */}
        <div className="text-center mt-4 text-sm text-gray-500">
          Already have an account?{" "}
          <span
            className="text-yellow-500 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Sign In
          </span>
        </div>
      </form>
    </AuthCard>
  );
}

