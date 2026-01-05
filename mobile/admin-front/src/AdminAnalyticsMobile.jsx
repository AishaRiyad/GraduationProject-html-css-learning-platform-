import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { getAnalyticsOverview } from "./AdminApi";

const screenW = Dimensions.get("window").width;

export default function AdminAnalyticsMobile() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setData(await getAnalyticsOverview());
      } catch (e) {
        setErr(e?.message || "failed");
      }
    })();
  }, []);

  const colors = useMemo(
    () => ["#f59e0b", "#ec4899", "#10b981", "#3b82f6", "#a78bfa"],
    []
  );

  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: "#ffffff",
      backgroundGradientTo: "#ffffff",
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
      propsForDots: { r: "3" },
      strokeWidth: 2,
    }),
    []
  );

  const safe = (arr) => (Array.isArray(arr) ? arr : []);

  const logins30Line = useMemo(() => {
    const rows = safe(data?.logins30);
    return {
      labels: rows.map((r) => String(r.day)),
      datasets: [{ data: rows.map((r) => Number(r.logins || 0)) }],
    };
  }, [data]);

  const loginsByUserBar = useMemo(() => {
    const rows = safe(data?.loginsByUser30);
    return {
      labels: rows.map((r) => String(r.name || "")),
      datasets: [{ data: rows.map((r) => Number(r.logins || 0)) }],
    };
  }, [data]);

  const topByProjectsBar = useMemo(() => {
    const rows = safe(data?.topByProjects);
    return {
      labels: rows.map((r) => String(r.name || "")),
      datasets: [{ data: rows.map((r) => Number(r.projects || 0)) }],
    };
  }, [data]);

  const topByQuizPassesBar = useMemo(() => {
    const rows = safe(data?.topByQuiz);
    return {
      labels: rows.map((r) => String(r.name || "")),
      datasets: [{ data: rows.map((r) => Number(r.passes || 0)) }],
    };
  }, [data]);

  const topByQuizRateBar = useMemo(() => {
    const rows = safe(data?.topByQuiz);
    return {
      labels: rows.map((r) => String(r.name || "")),
      datasets: [{ data: rows.map((r) => Number(r.pass_rate || 0)) }],
    };
  }, [data]);

  const supervisorRatingsBarAvg = useMemo(() => {
    const rows = safe(data?.supervisorRatings);
    return {
      labels: rows.map((r) => String(r.supervisor_name || "")),
      datasets: [{ data: rows.map((r) => Number(r.avg_overall || 0)) }],
    };
  }, [data]);

  const supervisorRatingsBarCount = useMemo(() => {
    const rows = safe(data?.supervisorRatings);
    return {
      labels: rows.map((r) => String(r.supervisor_name || "")),
      datasets: [{ data: rows.map((r) => Number(r.total_reviews || 0)) }],
    };
  }, [data]);

  const studentRatingsBarAvg = useMemo(() => {
    const rows = safe(data?.studentRatings);
    return {
      labels: rows.map((r) => String(r.student_name || "")),
      datasets: [{ data: rows.map((r) => Number(r.avg_overall || 0)) }],
    };
  }, [data]);

  const studentRatingsBarCount = useMemo(() => {
    const rows = safe(data?.studentRatings);
    return {
      labels: rows.map((r) => String(r.student_name || "")),
      datasets: [{ data: rows.map((r) => Number(r.total_reviews || 0)) }],
    };
  }, [data]);

  const rolesPie = useMemo(() => {
    const rows = safe(data?.roles);
    return rows.map((r, i) => ({
      name: String(r.role || ""),
      c: Number(r.c || 0),
      color: colors[i % colors.length],
      legendFontColor: "#0f172a",
      legendFontSize: 12,
    }));
  }, [data, colors]);

  const topStudentsProjectsBar = useMemo(() => {
    const rows = safe(data?.topStudents);
    return {
      labels: rows.map((r) => String(r.name || "")),
      datasets: [{ data: rows.map((r) => Number(r.projects || 0)) }],
    };
  }, [data]);

  const topStudentsLoginsBar = useMemo(() => {
    const rows = safe(data?.topStudents);
    return {
      labels: rows.map((r) => String(r.name || "")),
      datasets: [{ data: rows.map((r) => Number(r.logins || 0)) }],
    };
  }, [data]);

  if (err)
    return (
      <View style={styles.errBox}>
        <Text style={styles.errText}>{err}</Text>
      </View>
    );

  if (!data)
    return (
      <View style={styles.loading}>
        <Text>Loading…</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Analytics Overview</Text>

      <View style={styles.kpiGrid}>
        {Object.entries(data.kpi || {}).map(([k, v]) => (
          <View key={k} style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>{k}</Text>
            <Text style={styles.kpiValue}>{String(v)}</Text>
          </View>
        ))}
      </View>

      <Card title="Logins (last 30 days)">
        <LineChart
          data={logins30Line}
          width={screenW - 32}
          height={260}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </Card>

      <Card title="Logins by user (last 30 days)">
        <BarChart
          data={loginsByUserBar}
          width={screenW - 32}
          height={260}
          chartConfig={chartConfig}
          fromZero
          showValuesOnTopOfBars
          style={styles.chart}
        />
      </Card>

      <Card title="Top students by projects">
        <BarChart
          data={topByProjectsBar}
          width={screenW - 32}
          height={260}
          chartConfig={{
            ...chartConfig,
            color: (o = 1) => `rgba(16, 185, 129, ${o})`,
          }}
          fromZero
          showValuesOnTopOfBars
          style={styles.chart}
        />
      </Card>

      <Card title="Top students by quiz (passes)">
        <BarChart
          data={topByQuizPassesBar}
          width={screenW - 32}
          height={260}
          chartConfig={{
            ...chartConfig,
            color: (o = 1) => `rgba(59, 130, 246, ${o})`,
          }}
          fromZero
          showValuesOnTopOfBars
          style={styles.chart}
        />
      </Card>

      <Card title="Top students by quiz (pass rate %)">
        <BarChart
          data={topByQuizRateBar}
          width={screenW - 32}
          height={260}
          chartConfig={{
            ...chartConfig,
            color: (o = 1) => `rgba(245, 158, 11, ${o})`,
          }}
          fromZero
          showValuesOnTopOfBars
          style={styles.chart}
        />
      </Card>

      <Card title="Supervisor Ratings (from Students) - Avg Rating">
        <BarChart
          data={supervisorRatingsBarAvg}
          width={screenW - 32}
          height={260}
          chartConfig={{
            ...chartConfig,
            color: (o = 1) => `rgba(236, 72, 153, ${o})`,
          }}
          fromZero
          showValuesOnTopOfBars
          style={styles.chart}
        />
      </Card>

      <Card title="Supervisor Ratings (from Students) - Reviews">
        <BarChart
          data={supervisorRatingsBarCount}
          width={screenW - 32}
          height={260}
          chartConfig={{
            ...chartConfig,
            color: (o = 1) => `rgba(16, 185, 129, ${o})`,
          }}
          fromZero
          showValuesOnTopOfBars
          style={styles.chart}
        />
      </Card>

      <Card title="Student Ratings (from Supervisors) - Avg Rating">
        <BarChart
          data={studentRatingsBarAvg}
          width={screenW - 32}
          height={260}
          chartConfig={{
            ...chartConfig,
            color: (o = 1) => `rgba(59, 130, 246, ${o})`,
          }}
          fromZero
          showValuesOnTopOfBars
          style={styles.chart}
        />
      </Card>

      <Card title="Student Ratings (from Supervisors) - Reviews">
        <BarChart
          data={studentRatingsBarCount}
          width={screenW - 32}
          height={260}
          chartConfig={{
            ...chartConfig,
            color: (o = 1) => `rgba(245, 158, 11, ${o})`,
          }}
          fromZero
          showValuesOnTopOfBars
          style={styles.chart}
        />
      </Card>

      <Card title="Roles distribution">
        <PieChart
          data={rolesPie}
          width={screenW - 32}
          height={260}
          accessor="c"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[0, 0]}
          hasLegend
          chartConfig={chartConfig}   
        />
      </Card>

      <Card title="Top students (activity) - Projects">
        <BarChart
          data={topStudentsProjectsBar}
          width={screenW - 32}
          height={260}
          chartConfig={{
            ...chartConfig,
            color: (o = 1) => `rgba(16, 185, 129, ${o})`,
          }}
          fromZero
          showValuesOnTopOfBars
          style={styles.chart}
        />
      </Card>

      <Card title="Top students (activity) - Logins">
        <BarChart
          data={topStudentsLoginsBar}
          width={screenW - 32}
          height={260}
          chartConfig={{
            ...chartConfig,
            color: (o = 1) => `rgba(59, 130, 246, ${o})`,
          }}
          fromZero
          showValuesOnTopOfBars
          style={styles.chart}
        />
      </Card>
    </ScrollView>
  );
}

function Card({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#be185d",
    marginBottom: 12,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  kpiCard: {
    width: (screenW - 16 * 2 - 10) / 2,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fde047",
    backgroundColor: "#fff",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  kpiLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#be185d",
  },
  card: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fde047",
    backgroundColor: "#fff",
    padding: 12,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: "800",
    marginBottom: 10,
    color: "#0f172a",
  },
  chart: {
    borderRadius: 14,
  },
  errBox: {
    padding: 12,
    margin: 12,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
  },
  errText: {
    color: "#b91c1c",
    fontWeight: "700",
  },
  loading: {
    padding: 20,
  },
});
