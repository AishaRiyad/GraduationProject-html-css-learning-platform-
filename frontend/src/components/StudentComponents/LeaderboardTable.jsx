import React from "react";

export default function LeaderboardTable({ data }) {
  return (
    <div className="bg-[#FFFDF5] border border-yellow-100 rounded-3xl shadow-md p-8">

      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 drop-shadow-sm">
  🏆 Top Performers
</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-gray-500 text-sm border-b">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">User</th>
              <th className="py-2 pr-4">Points</th>
              <th className="py-2 pr-4">Rank</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row.user_id} className="border-b last:border-none hover:bg-gray-50">
                <td className="py-3 pr-4">{idx + 1}</td>
                <td className="py-3 pr-4 flex items-center gap-3">
                  {row.photo_url ? (
                    <img src={row.photo_url} className="h-8 w-8 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                  )}
                  <span className="font-medium">{row.full_name}</span>
                </td>
                <td className="py-3 pr-4 font-semibold">{row.total_points}</td>
                <td className="py-3 pr-4">
                  <span className="px-3 py-1 text-xs rounded-full bg-gray-100">
                    {row.user_rank || row.rank || "Beginner"}
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan="4" className="py-6 text-center text-gray-500">No data.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
