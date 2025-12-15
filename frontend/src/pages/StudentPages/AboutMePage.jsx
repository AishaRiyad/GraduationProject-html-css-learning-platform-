// src/pages/AboutMePage.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckIcon, XMarkIcon , PencilIcon } from "@heroicons/react/24/solid";
const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function AboutMePage({ formData,
  setFormData,
  editMode,
  setEditMode,
  handleSave,
  changingPassword,
  setChangingPassword,
  handleToggleChangePassword,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  handleSavePassword }) {
    
  return (
    
    <div className="p-6 bg-gray-50 rounded-xl shadow-md space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-yellow-600">About Me</h2>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex justify-center items-center px-3 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold rounded-lg transition"
          >
            <PencilIcon className="w-6 h-6" />
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-green-400 hover:bg-green-500 text-white font-semibold rounded-lg transition"
            >
              <CheckIcon className="w-5 h-5 mr-2" /> Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="flex items-center px-4 py-2 bg-red-400 hover:bg-red-500 text-white font-semibold rounded-lg transition"
            >
             <XMarkIcon className="w-5 h-5 mr-2" /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Full Name" name="full_name" value={formData.full_name} setFormData={setFormData} readOnly={!editMode} />
        <InputField label="Email" name="email" value={formData.email} setFormData={setFormData} readOnly={!editMode} />
        <InputField label="Phone Number" name="phone_number" value={formData.phone_number} setFormData={setFormData} readOnly={!editMode} />
        <InputField label="City" name="city" value={formData.city} setFormData={setFormData} readOnly={!editMode} />
        <InputField label="Address" name="address" value={formData.address} setFormData={setFormData} readOnly={!editMode} />
       
        <InputField label="About Me" name="about_me" value={formData.about_me} setFormData={setFormData} readOnly={!editMode} textarea />
      </div>
      <div className="mt-4 p-4 border rounded-lg bg-white">
        <label className="text-gray-700 font-medium mb-2 block">Password</label>

        {/* masked current (readonly) that reflects DB length */}
        <div className="flex items-center space-x-3">
          <input
            type="password"
            value={formData.password || ""}
            readOnly
            className="flex-1 border rounded-lg p-3 bg-gray-100"
          />

          {/* Toggle to show the change password inputs */}
          {editMode && (
  <div>
    <button onClick={handleToggleChangePassword}>
      {changingPassword ? "Cancel" : "Change Password"}
    </button>

    {changingPassword && (
      <div className="mt-2 space-y-2">
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current password"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
        />
        <button onClick={handleSavePassword}>Save Password</button>
      </div>
    )}
  </div>
)}
        </div>

        {/* if user clicked Change -> show inputs to enter current (confirm) and new password */}
        {changingPassword && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm text-gray-600">Enter current password (for confirmation)</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1"
                placeholder="Current password"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">New password (min 8 characters)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1"
                placeholder="New password"
              />
            </div>

            <div className="flex space-x-2">
              <button onClick={handleSavePassword} className="px-4 py-2 bg-green-500 text-white rounded-lg">
                Save password
              </button>
              <button onClick={() => { setChangingPassword(false); setCurrentPassword(""); setNewPassword(""); }} className="px-4 py-2 bg-gray-300 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InputField({ label, name, value, setFormData, readOnly, textarea = false, type = "text"  }) {
  const handleChange = (e) => setFormData((prev) => ({ ...prev, [name]: e.target.value }));

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-gray-700 font-medium">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={handleChange}
          readOnly={readOnly}
          className={`border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition ${
            readOnly ? "bg-gray-100" : "bg-white"
          }`}
        />
      ) : (
        <input
        type={type}
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        className={`border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition ${
          readOnly ? "bg-gray-100" : "bg-white"
        }`}
      />
      )}
    </div>
  );
}

