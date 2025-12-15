import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../components/StudentComponents/Loader";
import SubmissionCard from "../../components/StudentComponents/SubmissionCard";

export default function MySubmissions() {
  const token = localStorage.getItem("token");
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!token) { setLoading(false); return; }
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:5000/api/submissions/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, []);

  if (!token) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-gray-600">
        Please login to view your submissions.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100 to-yellow-200 px-4 py-10">

      <h1 className="text-2xl font-bold text-gray-800 mb-4">My Submissions</h1>
      {loading ? (
        <Loader />
      ) : (
       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {subs.map((s) => <SubmissionCard key={s.id} submission={s} />)}
          {subs.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-gray-500">
              You haven’t submitted anything yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
