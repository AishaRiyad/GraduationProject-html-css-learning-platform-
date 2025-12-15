import React, { useEffect, useState } from "react";
import axios from "axios";
import ChallengeCard from "../../components/ChallengeCard";
import Loader from "../../components/Loader";

export default function WeeklyBattle() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:5000/api/challenges/weekly");
      setList(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100 to-yellow-200 px-4 py-10">

      <div className="bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-100 rounded-3xl p-8 shadow-lg mb-8 border border-yellow-100">
  <h1 className="text-3xl font-extrabold text-gray-900 mb-2">⚔️ Weekly Battle</h1>
  <p className="text-gray-700 text-lg">
    Fresh new challenges every week! Compete, submit, and climb the leaderboard 🏆
  </p>
</div>


      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
          {list.length === 0 && (
            <div className="col-span-full text-gray-500">No weekly challenges now.</div>
          )}
        </div>
      )}
    </div>
  );
}
