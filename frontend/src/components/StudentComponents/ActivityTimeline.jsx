export default function ActivityTimeline({ stats }) {
  if (!stats || !stats.activityTimeline) {
    return <p>No activity available.</p>;
  }

  const items = stats.activityTimeline;

  if (items.length === 0) {
    return <p className="text-gray-500">No recent activity.</p>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h2 className="text-xl font-bold mb-4">Recent Activity</h2>

      <ul className="space-y-4">
        {items.map((a, i) => (
          <li key={i} className="border p-3 rounded-lg bg-yellow-50">
            <strong className="capitalize">{a.type}</strong>
            <p>{a.task}</p>
            <span className="text-sm text-gray-600">
              {new Date(a.time).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
