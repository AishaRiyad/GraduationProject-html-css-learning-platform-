import React, { useEffect, useState } from "react";
import axios from "axios";
import ChallengeCard from "../../components/StudentComponents/ChallengeCard";
import Loader from "../../components/StudentComponents/Loader";

export default function ChallengesList() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = difficulty
        ? `http://localhost:5000/api/challenges?difficulty=${difficulty}`
        : `http://localhost:5000/api/challenges`;
      const { data } = await axios.get(url);
      setChallenges(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [difficulty]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100 to-yellow-200 px-4 py-10">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Challenges</h1>
        <select
  className="
    appearance-none
    bg-[#FFFDF5]
    border border-yellow-300
    text-gray-800
    text-sm
    font-medium
    rounded-full
    px-5
    py-2.5
    shadow-sm
    cursor-pointer
    focus:outline-none
    focus:ring-2
    focus:ring-yellow-400
    hover:shadow-md
    transition-all
  "
  value={difficulty}
  onChange={(e) => setDifficulty(e.target.value)}
  style={{
    backgroundImage:
      "url('data:image/svg+xml;utf8,<svg fill=%22%23333%22 height=%2220%22 viewBox=%220 0 24 24%22 width=%2220%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/></svg>')",
    backgroundRepeat: "no-repeat",
    backgroundPositionX: "95%",
    backgroundPositionY: "center",
  }}
>
  <option value="">🎯 All difficulties</option>
  <option value="easy">🟢 Easy</option>
  <option value="medium">🟡 Medium</option>
  <option value="hard">🔴 Hard</option>
</select>

      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {challenges.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
          {challenges.length === 0 && (
            <div className="col-span-full text-gray-500">No challenges found.</div>
          )}
        </div>
      )}
    </div>
  );
}
