// pages/MobileSupervisorHome.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import axios from "axios";

// SVG
import Svg, {
  Circle,
  Rect,
  Line,
  Path,
  Text as SvgText,
} from "react-native-svg";

const API = "http://10.0.2.2:5000";
const screenWidth = Dimensions.get("window").width - 40;

/* ============================================
   PIE CHART (with percentage labels)
   ============================================ */
function SimplePieChart({ data, size = 200 }) {
  const radius = size / 2;
  const total = data.reduce((s, item) => s + item.value, 0);
  let startAngle = 0;

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={size} height={size}>
        {data.map((slice, i) => {
          const angle = total > 0 ? (slice.value / total) * Math.PI * 2 : 0;

          if (isNaN(angle)) return null;

          const largeArc = angle > Math.PI ? 1 : 0;

          const x1 = radius + radius * Math.cos(startAngle);
          const y1 = radius + radius * Math.sin(startAngle);

          const x2 = radius + radius * Math.cos(startAngle + angle);
          const y2 = radius + radius * Math.sin(startAngle + angle);

          const mid = startAngle + angle / 2;
          const labelX = radius + radius * 0.55 * Math.cos(mid);
          const labelY = radius + radius * 0.55 * Math.sin(mid);

          const percent =
            total > 0 ? ((slice.value / total) * 100).toFixed(0) : "0";

          const path = `
            M${radius},${radius}
            L${x1},${y1}
            A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2}
            Z
          `;

          startAngle += angle;

          return (
            <React.Fragment key={i}>
              <Path d={path} fill={slice.color} stroke="#fff" strokeWidth={2} />
              <SvgText
                x={labelX}
                y={labelY}
                textAnchor="middle"
                fill="#000"
                fontSize="14"
                fontWeight="bold"
              >
                {percent}%
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={{ marginTop: 10 }}>
        {data.map((item, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 2,
            }}
          >
            <View
              style={{
                width: 14,
                height: 14,
                backgroundColor: item.color,
                marginRight: 5,
              }}
            />
            <Text style={{ color: "#333" }}>
              {item.label}: {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ============================================
   BAR CHART (with labels)
   ============================================ */
function SimpleBarChart({ data, width = screenWidth, height = 220 }) {
  if (!data.length) {
    return (
      <View style={{ padding: 8 }}>
        <Text style={{ color: "#666" }}>No tasks available.</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = width / data.length - 30;

  return (
    <Svg width={width} height={height}>
      <Line
        x1={0}
        y1={height - 20}
        x2={width}
        y2={height - 20}
        stroke="#ccc"
        strokeWidth={2}
      />

      {data.map((item, i) => {
        const value = item.value ?? 0;
        const barH = (value / maxValue) * (height - 60);

        const x = i * (barWidth + 20) + 20;
        const y = height - 20 - barH;

        return (
          <React.Fragment key={i}>
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              fill="#facc15"
              rx={6}
            />

            <SvgText
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize="12"
              fill="#333"
            >
              {value}%
            </SvgText>

            <SvgText
              x={x + barWidth / 2}
              y={height - 2}
              textAnchor="middle"
              fontSize="10"
              fill="#444"
            >
              {item.label}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

/* ============================================
   LINE CHART
   ============================================ */
function SimpleLineChart({ data, width = screenWidth, height = 200 }) {
  if (!data.length) {
    return (
      <View style={{ padding: 8 }}>
        <Text style={{ color: "#666" }}>No submissions yet.</Text>
      </View>
    );
  }

  const maxV = Math.max(...data.map((d) => d.value), 1);

  const pts = data.map((p, i) => {
    const x = data.length === 1 ? width / 2 : (i / (data.length - 1)) * width;
    const y = height - (p.value / maxV) * (height - 30);
    return { x, y, value: p.value };
  });

  return (
    <Svg width={width} height={height}>
      <Path
        d={`M${pts.map((p) => `${p.x},${p.y}`).join(" L ")}`}
        stroke="#facc15"
        strokeWidth="3"
        fill="none"
      />

      {pts.map((p, i) => (
        <React.Fragment key={i}>
          <Circle
            cx={p.x}
            cy={p.y}
            r={5}
            fill="#facc15"
            stroke="#fff"
            strokeWidth={2}
          />
          <SvgText
            x={p.x}
            y={p.y - 8}
            textAnchor="middle"
            fontSize="12"
            fill="#333"
            fontWeight="bold"
          >
            {p.value}
          </SvgText>
        </React.Fragment>
      ))}
    </Svg>
  );
}

/* ============================================
   MAIN SCREEN
   ============================================ */
export default function MobileSupervisorHome({ supervisorId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!supervisorId) return;

    axios
      .get(`${API}/api/supervisor/dashboard/${supervisorId}`)
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error loading dashboard:", err));
  }, [supervisorId]);

  if (!stats) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text>Loading...</Text>
      </View>
    );
  }

  /* === CHART DATA (NO NaN) === */
  const pieData = [
    {
      label: "Assigned",
      value: stats.totalAssignments || 0,
      color: "#fde047",
    },
    {
      label: "Submitted",
      value: stats.totalSubmissions || 0,
      color: "#facc15",
    },
    {
      label: "Graded",
      value: stats.totalGraded || 0,
      color: "#4ade80",
    },
  ];

  const barData = (stats.submissionRate || []).map((t) => ({
    label: t.title,
    value:
      t.assigned && t.assigned > 0
        ? Math.round((t.submissions / t.assigned) * 100)
        : 0,
  }));

  const lineData = (stats.recentSubs || []).map((s, i) => ({
    value: i + 1,
  }));

  return (
    <ScrollView style={{ paddingBottom: 80, paddingHorizontal: 10 }}>
      {/* METRICS (مثل الويب الجزء العلوي) */}
      <View style={styles.metricsRow}>
        <Metric title="Total Tasks" value={stats.totalTasks} />
        <Metric title="Assigned Students" value={stats.totalAssignments} />
      </View>

      <View style={styles.metricsRow}>
        <Metric title="Submissions" value={stats.totalSubmissions} />
        <Metric title="Top Active Students" value={stats.topStudents.length} />
      </View>

      {/* PIE CHART - Overall Progress */}
      <ChartBox title="Overall Progress">
        <SimplePieChart data={pieData} />
      </ChartBox>

      {/* BAR CHART - Submission Rate Per Task */}
      <ChartBox title="Submission Rate Per Task">
        <SimpleBarChart data={barData} />
      </ChartBox>

      {/* LINE CHART - Recent Submissions */}
      <ChartBox title="Recent Submissions (Trend)">
        <SimpleLineChart data={lineData} />
      </ChartBox>

      {/* ======== UPCOMING DEADLINES ======== */}
      <SectionBox title="Upcoming Deadlines">
        {stats.upcoming.length === 0 ? (
          <Text style={styles.emptyText}>No upcoming deadlines</Text>
        ) : (
          stats.upcoming.map((task, i) => (
            <View key={i} style={styles.deadlineRow}>
              <View>
                <Text style={styles.deadlineTitle}>{task.title}</Text>
                <Text style={styles.deadlineSub}>
                  Due: {new Date(task.due_date).toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </SectionBox>

      {/* ======== OVERDUE TASKS ======== */}
      <SectionBox title="Overdue Tasks" danger>
        {stats.overdue.length === 0 ? (
          <Text style={[styles.emptyText, { color: "green" }]}>
            No overdue tasks 🎉
          </Text>
        ) : (
          stats.overdue.map((task, i) => (
            <View key={i} style={[styles.deadlineRow, styles.overdueRow]}>
              <View>
                <Text style={[styles.deadlineTitle, { color: "#b91c1c" }]}>
                  {task.title}
                </Text>
                <Text style={styles.deadlineSub}>
                  Was due: {new Date(task.due_date).toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </SectionBox>

      {/* ======== TOP STUDENTS ======== */}
      <SectionBox title="Top Active Students">
        {stats.topStudents.length === 0 ? (
          <Text style={styles.emptyText}>No submissions yet.</Text>
        ) : (
          stats.topStudents.map((s, i) => (
            <View key={i} style={styles.studentRow}>
              <View style={styles.avatarCircle}>
                <Text style={{ color: "#111", fontWeight: "700" }}>
                  {s.name?.charAt(0)?.toUpperCase() || "S"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>{s.name}</Text>
                <Text style={styles.studentSub}>
                  Submissions: {s.total}
                </Text>
              </View>
            </View>
          ))
        )}
      </SectionBox>

      {/* ======== STUDENTS FALLING BEHIND ======== */}
      <SectionBox title="Students Falling Behind" danger>
        {stats.fallingBehind.length === 0 ? (
          <Text style={styles.emptyText}>No one is falling behind 🎉</Text>
        ) : (
          stats.fallingBehind.map((s, i) => (
            <View key={i} style={styles.studentRow}>
              <View style={[styles.avatarCircle, { backgroundColor: "#fee2e2" }]}>
                <Text style={{ color: "#b91c1c", fontWeight: "700" }}>
                  {s.name?.charAt(0)?.toUpperCase() || "S"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.studentName, { color: "#b91c1c" }]}>
                  {s.name}
                </Text>
                <Text style={styles.studentSub}>
                  Behind in: {s.title}
                </Text>
              </View>
            </View>
          ))
        )}
      </SectionBox>

      {/* ======== RECENT SUBMISSIONS LIST ======== */}
      <SectionBox title="Recent Submissions (List)">
        {stats.recentSubs.length === 0 ? (
          <Text style={styles.emptyText}>No submissions yet.</Text>
        ) : (
          stats.recentSubs.map((sub, i) => (
            <View key={i} style={styles.submissionRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.submissionName}>{sub.name}</Text>
                <Text style={styles.submissionSub}>
                  Submitted at:{" "}
                  {new Date(sub.submitted_at).toLocaleString()}
                </Text>
                {sub.grade != null && (
                  <Text style={styles.submissionGrade}>
                    Grade: {sub.grade}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </SectionBox>
    </ScrollView>
  );
}

/* ============================================
   COMPONENTS
   ============================================ */

const Metric = ({ title, value }) => (
  <View style={styles.metricBox}>
    <Text style={styles.metricTitle}>{title}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const ChartBox = ({ title, children }) => (
  <View style={styles.chartBox}>
    <Text style={styles.chartTitle}>{title}</Text>
    {children}
  </View>
);

const SectionBox = ({ title, danger, children }) => (
  <View
    style={[
      styles.sectionBox,
      danger && { borderLeftColor: "#dc2626", borderLeftWidth: 3 },
    ]}
  >
    <Text
      style={[
        styles.sectionTitle,
        danger && { color: "#b91c1c" },
      ]}
    >
      {title}
    </Text>
    {children}
  </View>
);

/* ============================================
   STYLES
   ============================================ */
const styles = StyleSheet.create({
  loadingWrapper: {
    marginTop: 50,
    alignItems: "center",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  metricBox: {
    flex: 1,
    padding: 14,
    marginHorizontal: 5,
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FFE7A3",
  },
  metricTitle: {
    fontSize: 12,
    color: "#666",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginTop: 6,
  },
  chartBox: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFE7A3",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  sectionBox: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFE7A3",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
  },

  deadlineRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  overdueRow: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  deadlineTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  deadlineSub: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },

  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  studentSub: {
    fontSize: 13,
    color: "#6b7280",
  },

  submissionRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  submissionName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  submissionSub: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  submissionGrade: {
    fontSize: 13,
    color: "#065f46",
    marginTop: 2,
    fontWeight: "600",
  },
});
