import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  PencilSquareIcon,
  PlusIcon,
  XMarkIcon,
  LinkIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline";

export default function SupervisorProfile() {
  const API = "http://localhost:5000";
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [skillsInput, setSkillsInput] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    bio: "",
    phone: "",
    location: "",
    skills: [],
    github: "",
    linkedin: "",
    website: "",
    profile_image: ""
  });

  // تحميل بيانات المستخدم
  useEffect(() => {
    if (storedUser) {
      setForm({
        full_name: storedUser.full_name || "",
        email: storedUser.email || "",
        bio: storedUser.bio || "",
        phone: storedUser.phone || "",
        location: storedUser.location || "",
        skills: storedUser.skills || [],
        github: storedUser.github || "",
        linkedin: storedUser.linkedin || "",
        website: storedUser.website || "",
        profile_image: storedUser.profile_image || "",
      });
    }
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function addSkill() {
    if (skillsInput.trim() !== "") {
      setForm({ ...form, skills: [...form.skills, skillsInput.trim()] });
      setSkillsInput("");
    }
  }

  function removeSkill(index) {
    const updated = [...form.skills];
    updated.splice(index, 1);
    setForm({ ...form, skills: updated });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("full_name", form.full_name);
    formData.append("email", form.email);
    formData.append("bio", form.bio);
    formData.append("phone", form.phone);
    formData.append("location", form.location);
    formData.append("skills", JSON.stringify(form.skills));
    formData.append("github", form.github);
    formData.append("linkedin", form.linkedin);
    formData.append("website", form.website);

    if (form.password?.trim()) formData.append("password", form.password);
    if (profileImageFile) formData.append("profile_image", profileImageFile);

    try {
      const res = await axios.put(
        `${API}/api/users/update-profile/${storedUser.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const p = res.data.profile;
      const meta = JSON.parse(p.profile_meta || "{}");

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: storedUser.id,
          role: storedUser.role,
          email: form.email,
          full_name: form.full_name,
          profile_image: p.profile_image
            ? `http://localhost:5000${p.profile_image}`
            : "/user-avatar.jpg",
          bio: p.bio,
          phone: p.phone,
          location: p.location,
          skills: meta.skills || [],
          github: meta.social?.github || "",
          linkedin: meta.social?.linkedin || "",
          website: meta.social?.website || "",
        })
      );

      window.location.reload();
    } catch (err) {
      console.error("UPDATE_ERROR:", err.response?.data || err.message);
      alert("Update failed!");
    }

    setLoading(false);
  }

  // PDF EXPORT
  async function exportPDF() {
  const doc = new jsPDF("p", "mm", "a4");

  // تحميل الصورة (الملف أو URL)
  let imageData = null;

  if (profileImageFile) {
    // لو المستخدم رفع صورة الآن
    imageData = await toBase64(profileImageFile);
  } else if (form.profile_image) {
    // تحميل الصورة من السيرفر
    const response = await fetch(form.profile_image);
    const blob = await response.blob();
    imageData = await toBase64(blob);
  }

  // خلفية بسيطة
  doc.setFillColor(255, 245, 204);
  doc.rect(0, 0, 210, 297, "F");

  // عنوان
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text("Supervisor Profile", 105, 20, { align: "center" });

  // صورة شخصية داخل دائرة
  if (imageData) {
    doc.addImage(imageData, "PNG", 78, 30, 55, 55);
    doc.setDrawColor(255, 204, 0);
    doc.setLineWidth(3);
    doc.circle(105, 58, 30); // دائرة حول الصورة
  }

  let y = 100;

  // ✨ معلومات أساسية
  doc.setFontSize(18);
  doc.text(form.full_name, 105, y, { align: "center" });
  y += 10;

  doc.setFontSize(12);
  doc.text(form.email, 105, y, { align: "center" });
  y += 15;

  // BIO
  if (form.bio) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Bio", 14, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    const splitBio = doc.splitTextToSize(form.bio, 180);
    doc.text(splitBio, 14, y);
    y += splitBio.length * 6 + 6;
  }

  // Contact Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Contact Information", 14, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.text(`Phone: ${form.phone || "-"}`, 14, y); y += 7;
  doc.text(`Location: ${form.location || "-"}`, 14, y); y += 15;

  // Skills
  doc.setFont("helvetica", "bold");
  doc.text("Skills", 14, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  if (form.skills.length > 0) {
    form.skills.forEach((s) => {
      doc.text(`• ${s}`, 18, y);
      y += 7;
    });
  } else {
    doc.text("No skills added.", 18, y);
    y += 7;
  }
  y += 10;

  // Social Links
  doc.setFont("helvetica", "bold");
  doc.text("Social Links", 14, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.text(`GitHub: ${form.github || "-"}`, 18, y); y += 7;
  doc.text(`LinkedIn: ${form.linkedin || "-"}`, 18, y); y += 7;
  doc.text(`Website: ${form.website || "-"}`, 18, y); y += 7;

  // حفظ PDF
  doc.save(`${form.full_name}_Profile.pdf`);
}

// لتحويل الصورة إلى Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


  return (
    <div className="max-w-4xl mx-auto mt-12">
      <div className="bg-white rounded-3xl shadow-lg p-10 border">

        {/* PROFILE IMAGE */}
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={
                profileImageFile
                  ? URL.createObjectURL(profileImageFile)
                  : form.profile_image || "/user-avatar.jpg"
              }
              className="w-32 h-32 rounded-full border-4 border-yellow-500 shadow-xl object-cover"
            />

            {editMode && (
              <label className="absolute bottom-0 right-0 bg-yellow-500 p-2 rounded-full cursor-pointer shadow-lg">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setProfileImageFile(e.target.files[0])}
                />
                <PencilSquareIcon className="h-5 w-5 text-white" />
              </label>
            )}
          </div>
        </div>

        {/* VIEW MODE */}
        {!editMode && (
          <div className="mt-8 text-center space-y-6">

            {/* NAME */}
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {form.full_name}
            </h2>

            {/* EMAIL */}
            <p className="flex items-center justify-center text-gray-700 gap-2">
              <EnvelopeIcon className="h-5 w-5 text-yellow-600" />
              {form.email}
            </p>

            {/* BIO */}
            {form.bio && (
              <p className="text-gray-700 max-w-xl mx-auto text-sm">
                {form.bio}
              </p>
            )}

            {/* CONTACT INFO */}
            <div className="flex flex-col items-center space-y-1 text-gray-700 text-sm">
              {form.phone && (
                <p className="flex items-center gap-2">
                  <PhoneIcon className="h-5 w-5 text-yellow-600" /> {form.phone}
                </p>
              )}
              {form.location && (
                <p className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-yellow-600" /> {form.location}
                </p>
              )}
            </div>

            {/* SKILLS */}
            {form.skills.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mt-6">Skills</h3>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {form.skills.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-full font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SOCIAL LINKS */}
            <div className="mt-6 space-y-2 text-gray-800 text-sm">
              {form.github && (
                <p className="flex justify-center gap-2">
                  <LinkIcon className="h-5 w-5 text-yellow-600" />
                  <a href={form.github} target="_blank" className="hover:underline">
                    GitHub
                  </a>
                </p>
              )}
              {form.linkedin && (
                <p className="flex justify-center gap-2">
                  <LinkIcon className="h-5 w-5 text-blue-600" />
                  <a href={form.linkedin} target="_blank" className="hover:underline">
                    LinkedIn
                  </a>
                </p>
              )}
              {form.website && (
                <p className="flex justify-center gap-2">
                  <LinkIcon className="h-5 w-5 text-green-600" />
                  <a href={form.website} target="_blank" className="hover:underline">
                    Website
                  </a>
                </p>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex justify-center gap-4 mt-8">
  {/* EDIT BUTTON */}
  <button
    className="px-8 py-3 rounded-xl font-semibold 
               bg-gradient-to-r from-yellow-400 to-yellow-500 
               text-black shadow-md hover:shadow-xl hover:scale-[1.03] 
               transition-all duration-200"
    onClick={() => setEditMode(true)}
  >
    Edit Profile
  </button>

  {/* EXPORT PDF BUTTON */}
  <button
    onClick={exportPDF}
    className="px-8 py-3 rounded-xl font-semibold 
               bg-[#0d1117] text-white shadow-md 
               hover:shadow-xl hover:scale-[1.03]
               transition-all duration-200"
  >
    Export as PDF
  </button>
</div>

          </div>
        )}

        {/* EDIT MODE — نفس اللي عندك بدون تغيير */}
        {editMode && (
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">

            {/* ----------- BASIC FIELDS ----------- */}
            <Input label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} />
            <Input label="Email" name="email" value={form.email} onChange={handleChange} />
            <Input label="New Password" name="password" type="password" onChange={handleChange} />

            {/* BIO */}
            <div>
              <label className="font-semibold">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl mt-1"
                rows={3}
              ></textarea>
            </div>

            {/* PHONE */}
            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />

            {/* LOCATION */}
            <Input label="Location" name="location" value={form.location} onChange={handleChange} />

            {/* ----------- SKILLS ----------- */}
            <div>
              <label className="font-semibold">Skills</label>
              <div className="flex gap-2 mt-2">
                <input
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full p-3 border rounded-xl"
                  placeholder="Add a skill"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-yellow-500 p-3 rounded-xl shadow"
                >
                  <PlusIcon className="h-5 w-5 text-white" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {form.skills.map((s, i) => (
                  <div
                    key={i}
                    className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2"
                  >
                    <span>{s}</span>
                    <XMarkIcon
                      onClick={() => removeSkill(i)}
                      className="h-4 w-4 text-red-600 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* SOCIAL LINKS */}
            <Input label="GitHub" name="github" value={form.github} onChange={handleChange} />
            <Input label="LinkedIn" name="linkedin" value={form.linkedin} onChange={handleChange} />
            <Input label="Website" name="website" value={form.website} onChange={handleChange} />

            {/* BUTTONS */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-yellow-500 text-black py-3 rounded-xl shadow hover:bg-yellow-600"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-300 py-3 rounded-xl"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------- INPUT COMPONENT ---------- */
function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-3 border rounded-xl mt-1"
      />
    </div>
  );
}
