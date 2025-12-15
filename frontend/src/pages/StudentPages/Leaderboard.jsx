import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../components/StudentComponents/Loader";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:5000/api/ai-local/leaderboard");
      setRows(data || []);
    } catch (e) {
      console.error("❌ Error fetching leaderboard:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // تحديث كل 15 ثانية
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100 to-yellow-200 px-4 py-10 flex flex-col items-center">
      <LeaderboardTable data={rows} />
    </div>
  );
}

function LeaderboardTable({ data }) {
  return (
    <div className="max-w-3xl w-full bg-white shadow-xl rounded-2xl p-6 border border-yellow-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        🏆 Top Performers
      </h2>

      {data.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No data.</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-yellow-200 bg-yellow-50">
              <th className="py-3 px-4 font-semibold text-gray-700">#</th>
              <th className="py-3 px-4 font-semibold text-gray-700">User</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Points</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Challenges</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.rank}
                className="border-b border-yellow-100 hover:bg-yellow-50 transition"
              >
                <td className="py-3 px-4 font-medium text-gray-800">{row.rank}</td>
                <td className="py-3 px-4 text-gray-800">{row.user_name}</td>
                <td className="py-3 px-4 text-yellow-700 font-semibold">{row.average_score}</td>
                <td className="py-3 px-4 text-gray-600">{row.total_challenges}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
