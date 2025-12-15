import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Users,
  FileText,
  TrendingUp,
  ClipboardList,
} from "lucide-react";

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const API = "http://localhost:5000";

export default function HomeContent({ supervisorId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!supervisorId) return;

    axios
      .get(`${API}/api/supervisor/dashboard/${supervisorId}`)
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, [supervisorId]);

  if (!stats) return <p>Loading...</p>;

  /* ======================= FORMATTING FUNCTION ======================= */
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ======================= PIE: ASSIGNED VS SUBMITTED VS GRADED ======================= */
  const taskProgressPie = {
    labels: ["Assigned", "Submitted", "Graded"],
    datasets: [
      {
        data: [
          stats.totalAssignments,
          stats.totalSubmissions,
          stats.totalGraded || 0,
        ],
        backgroundColor: ["#fde047", "#facc15", "#4ade80"],
      },
    ],
  };

  /* ======================= BAR: SUBMISSION RATE PER TASK ======================= */
  const submissionRateBar = {
    labels: stats.submissionRate.map((t) => t.title),
    datasets: [
      {
        label: "Submission % per Task",
        data: stats.submissionRate.map((t) =>
          t.assigned === 0
            ? 0
            : Math.round((t.submissions / t.assigned) * 100)
        ),
        backgroundColor: "#facc15",
      },
    ],
  };

  /* ======================= LINE: RECENT SUBMISSIONS OVER TIME ======================= */
  const lineData = {
    labels: stats.recentSubs.map((s) =>
      new Date(s.submitted_at).toLocaleDateString("en-GB")
    ),
    datasets: [
      {
        label: "Recent Submissions",
        data: stats.recentSubs.map((_, idx) => idx + 1),
        borderColor: "#facc15",
        backgroundColor: "#fde047",
      },
    ],
  };

  return (
    <div className="space-y-12">

      {/* ======================= TOP METRICS ======================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={<ClipboardList className="w-10 h-10 text-yellow-600" />}
        />

        <MetricCard
          title="Assigned Students"
          value={stats.totalAssignments}
          icon={<Users className="w-10 h-10 text-yellow-600" />}
        />

        <MetricCard
          title="Submissions"
          value={stats.totalSubmissions}
          icon={<FileText className="w-10 h-10 text-yellow-600" />}
        />

        <MetricCard
          title="Top Active Students"
          value={stats.topStudents.length}
          icon={<TrendingUp className="w-10 h-10 text-yellow-600" />}
        />
      </div>

      {/* ======================= PIE CHART ======================= */}
      <Section title="Overall Progress">
        <div className="w-64 mx-auto">
          <Doughnut data={taskProgressPie} />
        </div>
      </Section>

      {/* ======================= BAR CHART ======================= */}
     {/* ======================= SUBMISSION RATE PER TASK ======================= */}
<Section title="Submission Rate Per Task">

  {stats.submissionRate.length === 0 ? (
    <p className="text-gray-500">No tasks available.</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

      {stats.submissionRate.map((task, i) => {
        const rate =
          task.assigned === 0
            ? 0
            : Math.round((task.submissions / task.assigned) * 100);

        const doughnutData = {
          labels: ["Submitted", "Remaining"],
          datasets: [
            {
              data: [rate, 100 - rate],
              backgroundColor: ["#facc15", "#e5e7eb"],
              borderWidth: 0,
            },
          ],
        };

        return (
          <div key={i} className="bg-white p-6 rounded-xl border shadow">

            <h3 className="text-lg font-bold mb-4">{task.title}</h3>

            <div className="w-48 mx-auto mb-4">
              <Doughnut data={doughnutData} />
            </div>

            {/* progress bar */}
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500"
                style={{ width: `${rate}%` }}
              ></div>
            </div>

            <p className="text-center mt-2 text-gray-700 font-semibold">
              {rate}% Submitted
            </p>

          </div>
        );
      })}

    </div>
  )}
</Section>





      {/* ======================= DEADLINES ======================= */}
      <Section title="Upcoming Deadlines">
        {stats.upcoming.length === 0 ? (
          <p className="text-gray-500">No upcoming deadlines</p>
        ) : (
          stats.upcoming.map((task, i) => (
            <DeadlineCard key={i} task={task} formatDate={formatDate} />
          ))
        )}
      </Section>

      {/* ======================= OVERDUE ======================= */}
      <Section title="Overdue Tasks" danger>
        {stats.overdue.length === 0 ? (
          <p className="text-green-600 font-semibold">
            No overdue tasks 🎉
          </p>
        ) : (
          stats.overdue.map((task, i) => (
            <OverdueCard key={i} task={task} formatDate={formatDate} />
          ))
        )}
      </Section>

      {/* ======================= RECENT SUBS ======================= */}
      <Section title="Recent Submissions">
        {stats.recentSubs.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          stats.recentSubs.map((sub, i) => (
            <RecentCard key={i} sub={sub} formatDate={formatDate} />
          ))
        )}
      </Section>
    </div>
  );
}

/* ======================= COMPONENTS ======================= */

const MetricCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow border flex items-center gap-4">
    <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-gray-600 text-sm">{title}</p>
      <h3 className="text-3xl font-bold">{value}</h3>
    </div>
  </div>
);

const Section = ({ title, children, danger }) => (
  <div className="bg-white p-6 rounded-xl shadow border">
    <h2
      className={`text-xl font-bold mb-4 ${
        danger ? "text-red-600" : "text-gray-800"
      }`}
    >
      {title}
    </h2>
    {children}
  </div>
);

const DeadlineCard = ({ task, formatDate }) => (
  <div className="p-3 border rounded-lg bg-yellow-50 flex justify-between">
    <strong>{task.title}</strong>
    <span>{formatDate(task.due_date)}</span>
  </div>
);

const OverdueCard = ({ task, formatDate }) => (
  <div className="p-3 border rounded-lg bg-red-50 flex justify-between">
    <strong>{task.title}</strong>
    <span className="text-red-700">{formatDate(task.due_date)}</span>
  </div>
);

const RecentCard = ({ sub, formatDate }) => (
  <div className="p-3 border rounded-lg bg-yellow-50 flex justify-between">
    <strong>{sub.name}</strong>
    <span>{formatDate(sub.submitted_at)}</span>
  </div>
);
