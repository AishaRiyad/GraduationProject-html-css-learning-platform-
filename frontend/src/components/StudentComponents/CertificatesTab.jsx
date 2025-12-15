import { useNavigate } from "react-router-dom";

export default function CertificatesTab({ userId }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-yellow-600">
        Your Certificates 🎓
      </h2>

      <p className="text-gray-700">
        View and download your earned certificates.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 🔶 HTML Certificate */}
        <div className="p-6 bg-yellow-50 border border-yellow-300 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
             onClick={() => navigate("/certificate/html")}>
          <h3 className="text-xl font-bold text-gray-800">HTML Certificate</h3>
          <p className="text-gray-600 mt-2">
            Certificate for completing the Basic HTML level.
          </p>
          <button className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600">
            View Certificate
          </button>
        </div>

        {/* 🔷 CSS Certificate */}
        <div className="p-6 bg-yellow-50 border border-yellow-300 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
             onClick={() => navigate("/certificate/css")}>
          <h3 className="text-xl font-bold text-gray-800">CSS Certificate</h3>
          <p className="text-gray-600 mt-2">
            Certificate for completing the CSS level.
          </p>
          <button className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600">
            View Certificate
          </button>
        </div>

      </div>
    </div>
  );
}
