import React, { useEffect, useState } from "react";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "./AdminApi";

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyProfile();
        setProfile({ name: data.name || "", email: data.email || "" });
      } catch (e) {
        console.error(e);
        setProfileErr(e.message || "Failed to load profile.");
      } finally {
        setLoadingProfile(false);
      }
    }
    load();
  }, []);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");
    try {
      await updateMyProfile(profile);
      setProfileMsg("Profile updated successfully.");
    } catch (e) {
      console.error(e);
      setProfileErr(e.message || "Failed to update profile.");
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwMsg("");
    setPwErr("");

    if (newPassword !== confirmNewPassword) {
      setPwErr("New password and confirmation do not match.");
      return;
    }

    try {
      await changeMyPassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPwMsg("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (e) {
      console.error(e);
      setPwErr(e.message || "Failed to change password.");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-pink-800 mb-2">Settings</h1>

      {/* Profile card */}
      <section className="bg-white/90 border border-yellow-200 rounded-2xl shadow p-4 space-y-3">
        <h2 className="text-lg font-semibold text-pink-700">Edit profile</h2>

        {loadingProfile ? (
          <div className="text-sm text-gray-500">Loading profile…</div>
        ) : (
          <form onSubmit={handleProfileSubmit} className="space-y-3 max-w-md">
            {profileErr && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {profileErr}
              </div>
            )}
            {profileMsg && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                {profileMsg}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                className="w-full border border-yellow-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                value={profile.name}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-yellow-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                value={profile.email}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex items-center px-4 py-2 rounded-full bg-yellow-300 hover:bg-yellow-400 text-sm font-semibold text-pink-800"
            >
              Save changes
            </button>
          </form>
        )}
      </section>

      {/* Password card */}
      <section className="bg-white/90 border border-yellow-200 rounded-2xl shadow p-4 space-y-3 max-w-md">
        <h2 className="text-lg font-semibold text-pink-700">Change password</h2>

        {pwErr && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {pwErr}
          </div>
        )}
        {pwMsg && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {pwMsg}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Current password
            </label>
            <input
              type="password"
              className="w-full border border-yellow-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              New password
            </label>
            <input
              type="password"
              className="w-full border border-yellow-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Confirm new password
            </label>
            <input
              type="password"
              className="w-full border border-yellow-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex items-center px-4 py-2 rounded-full bg-pink-500 hover:bg-pink-600 text-sm font-semibold text-white"
          >
            Update password
          </button>
        </form>
      </section>
    </div>
  );
}
