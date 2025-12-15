// src/components/ProfilePage.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import AboutMePage from "../../pages/StudentPages/AboutMePage";
import TasksTab from "./TasksTab";
import CertificatesTab from "./CertificatesTab";
const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function LessonProgress({ userId }) {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");

    axios
      .get(`http://localhost:5000/api/lessons/progress/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProgress(res.data.progress || []);
        setCurrentLesson(res.data.currentLesson || null);
      })
      .catch((err) => console.error("Error loading lesson progress:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p>Loading lessons...</p>;
  if (!progress.length) return <p className="text-gray-600">No lessons found yet.</p>;

  const completed = progress.filter((l) => l.is_completed).length;
  const total = progress.length;
  const percentage = Math.round((completed / total) * 100);

  // 🧠 تحديد الدرس الحالي بالاعتماد على الترتيب المنطقي (display_number)
  const current = progress.find((l) => !l.is_completed);
  const currentDisplay = current ? current.display_number : total;

  return (
    <div className="space-y-6">
      {/* ✅ شريط التقدم */}
      <div>
        <p className="font-semibold text-gray-700 mb-1">
          Progress: {completed}/{total} lessons ({percentage}%)
        </p>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-yellow-500 h-3 rounded-full transition-all duration-700"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* ✅ عرض الدروس كبطاقات صفراء */}
      <div className="flex flex-col gap-3">

        {progress.map((lesson) => (
  <div
    key={lesson.lesson_id}
    className={`flex items-center justify-between p-4 rounded-lg border border-yellow-300 bg-yellow-50 shadow-sm hover:shadow-md transition-all duration-300`}
  >
    <div>
      <h3 className="font-semibold text-gray-800 text-base">
        {lesson.title}
      </h3>
      <p className="text-sm text-gray-700 mt-1">
        {lesson.is_completed ? "✅ Completed" : "🔓 In Progress"}
      </p>
    </div>

    <span
      className={`text-sm font-semibold ${
        lesson.quiz_passed ? "text-green-600" : "text-gray-500"
      }`}
    >
      {lesson.quiz_passed ? `Score: ${lesson.quiz_score}%` : "Not Passed"}
    </span>
  </div>
))}

      </div>

      {/* ✅ الدرس الحالي */}
      {currentLesson && (
        <div className="mt-8 text-center">
          <p className="text-yellow-700 font-bold text-xl flex justify-center items-center gap-2">
            🎯 You’re currently on Lesson {currentDisplay}
          </p>
        </div>
      )}
    </div>
  );
}



export default function ProfilePage({ currentUser, setCurrentUser }) {
  const [activeTab, setActiveTab] = useState("About Me");
  const [user, setUser] = useState(currentUser || null);
  const [profileImage, setProfileImage] = useState("/user-avatar.jpg");
  
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    city: "",
    address: "",
    about_me: "",
    password: "",
  });
  const navigate = useNavigate();

  // ✅ تحميل بيانات المستخدم
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);

    axios
      .get(`${API}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data.user;
        setUser({
          id: data.id,
          name: data.full_name || data.name,
          email: data.email,
          profile_image: data.profile_image || "/user-avatar.jpg",
          last_login: data.last_login,
        });
        setProfileImage(data.profile_image || "/user-avatar.jpg");
         setFormData({
          full_name: data.full_name,
          email: data.email,
          phone_number: data.phone_number || "",
          city: data.city || "",
          address: data.address || "",
          about_me: data.about_me || "",
           password: data.passwordLength ? "•".repeat(data.passwordLength) : "",
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Error fetching profile. Please login again.");
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // ✅ رفع الصورة الجديدة
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return alert("اختر صورة أولاً");
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      alert("الرجاء اختيار صورة بصيغة png أو jpg أو jpeg");
      return;
    }

    const formData = new FormData();
    formData.append("profile_image", file);

    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(`${API}/api/profile/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      

      const newImage = res.data.profile_image;
      if (setCurrentUser) {
        setCurrentUser((prev) => ({
          ...prev,
          profile_image: newImage,
        }));
      }

      setProfileImage(newImage);
      setUser((prev) => ({ ...prev, profile_image: newImage }));
      alert("✅ image uploaded succesfully");
    } catch (err) {
      console.error("Upload error:", err);
      alert("upload image failed😢");
    }
  };
const handleSave = async () => {
  try {
    const token = localStorage.getItem("token");

    // فقط حقول الملف الشخصي العادي بدون password
    const { password, ...profileData } = formData;

    await axios.put(`${API}/api/profile/update`, profileData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUser((prev) => ({ ...prev, ...profileData }));
    setEditMode(false);
    alert("✅ Profile updated successfully!");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Error updating profile");
  }
};

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;

  // دالة لتحويل last_login للتنسيق المطلوب
function formatLastLogin(dateString) {
  if (!dateString) return "Not available";

  const date = new Date(dateString);

  const options = { weekday: "long" }; // Day name short e.g., Mon
  const day = new Intl.DateTimeFormat("en-US", options).format(date);

  const formattedDate = `${day}, ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // تحويل الساعة للـ 12h format

  const time = `${hours}:${minutes} ${ampm}`;

  return `${formattedDate} ${time}`;
}

  const handleToggleChangePassword = () => {
  setChangingPassword((s) => !s);
  setCurrentPassword("");
  setNewPassword("");
};

const handleSavePassword = async () => {
  if (!currentPassword) return alert("Please enter your current password");
  if (!newPassword || newPassword.length < 8) return alert("New password must be at least 8 characters");

  try {
    const token = localStorage.getItem("token");
    await axios.put(
      `${API}/api/profile/password`,
      { oldPassword: currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // تحديث العرض بعد النجاح
    setFormData((prev) => ({ ...prev, password: "•".repeat(newPassword.length) }));
    setChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    alert("Password updated successfully!");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Failed to update password");
  }
};



  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-600 flex items-center space-x-2">
          
           <span>Welcome, {user.name}</span>
           <span>👋</span>
        </h1>
       
      </div>

      <p className="text-gray-700 mt-2 text-lg">
        Here’s your profile page. You can update your info and settings below ✨
      </p>

      {/* User Info Card */}
      <div className="flex items-center p-6 bg-yellow-50 rounded-xl shadow-md space-x-6">
        {/* Profile Image */}
        <div className="relative">
           <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-300 shadow-lg">
  <img
    src={profileImage.startsWith("http") || profileImage.startsWith("/") ? profileImage : `${API}${profileImage}`}
    alt="/user-avatar.jpg"
    className="absolute top-0 left-0 w-full h-full object-cover"
  />
</div>

          <label className="absolute bottom-0 right-0 bg-yellow-400 p-1 rounded-full cursor-pointer hover:bg-yellow-500">
            <input type="file" className="hidden" onChange={handleImageChange} />
            <UserCircleIcon className="w-5 h-5 text-white" />
          </label>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-600 text-sm">Email: {user.email}</p>
          <p className="text-gray-600 text-sm">
  Last login: {formatLastLogin(user.last_login)}
</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        {["About Me", "Lessons", "Tasks", "Certificates"].map((tab) => (
          <button
            key={tab}
            className={`py-2 px-4 transition font-medium ${
              activeTab === tab
                ? "text-yellow-500 border-b-2 border-yellow-500"
                : "text-gray-700 hover:text-yellow-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* محتوى التبويب */}
      <div className="mt-4">
        {activeTab === "About Me" && (
          <AboutMePage
  formData={formData}
  setFormData={setFormData}
  editMode={editMode}
  setEditMode={setEditMode}
  handleSave={handleSave}
  changingPassword={changingPassword}
   setChangingPassword={setChangingPassword} 
  handleToggleChangePassword={handleToggleChangePassword}
  currentPassword={currentPassword}
  setCurrentPassword={setCurrentPassword}
  newPassword={newPassword}
  setNewPassword={setNewPassword}
  handleSavePassword={handleSavePassword}
/>
        )}
        {activeTab === "Lessons" && (
  <div className="space-y-4">
    <h2 className="text-2xl font-semibold text-yellow-600">Your Lesson Progress 📘</h2>
    <p className="text-gray-700 mb-4">
      Here’s your progress through the Basic HTML & CSS lessons:
    </p>

    {/* ✅ جلب التقدم من السيرفر */}
    <LessonProgress userId={user?.id} />
  </div>
)}

        {activeTab === "Tasks" && <TasksTab userId={user?.id} />}

       {activeTab === "Certificates" && (
  <CertificatesTab userId={user?.id} />
)}

        
      </div>
    </div>
  );
}
