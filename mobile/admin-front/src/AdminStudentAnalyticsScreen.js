import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { getStudentAnalytics } from "./AdminApi";

export default function AdminStudentAnalyticsScreen({ route }) {
  const userId = route?.params?.userId; // navigation.navigate("AdminStudentAnalytics", { userId })

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setData(null);
        const res = await getStudentAnalytics(userId);
        setData(res);
      } catch (e) {
        setErr(e.message || "failed");
      }
    })();
  }, [userId]);

  const screenW = Dimensions.get("window").width;
  const chartW = Math.max(320, screenW - 28);

  const u = data?.user;

  const quizPoints = useMemo(() => {
    const arr = data?.charts?.quizzes || [];
    const labels = arr.map((q) => `${q.topic}-${q.level_number}`);
    const values = arr.map((q) => Number(q.score || 0));
    return { labels, values };
  }, [data]);

  const projectsMonthly = useMemo(() => {
    const arr = data?.charts?.projectsMonthly || [];
    const labels = arr.map((r) => String(r.ym || "").slice(0, 7));
    const values = arr.map((r) => Number(r.c || 0));
    return { labels, values };
  }, [data]);

  const logins30 = useMemo(() => {
    const arr = data?.charts?.logins30 || [];
    const labels = arr.map((r) => r.day);
    const values = arr.map((r) => Number(r.cnt || 0));
    return { labels, values };
  }, [data]);

  if (err) {
    return (
      <View style={styles.page}>
        <Text style={styles.errBox}>{err}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.page}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#64748b" }}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.h1}>
        Student Analytics — {u?.name || "Student"} ({u?.email || ""})
      </Text>

      {/* Summary */}
      <View style={styles.kpiGrid}>
        <KpiCard label="Projects total" value={data?.summary?.projects_total} />
        <KpiCard label="Quiz attempts" value={data?.summary?.quiz_attempts} />
        <KpiCard label="Quiz pass rate" value={`${data?.summary?.quiz_pass_rate}%`} />
      </View>

      {/* Quiz scores per level */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quiz scores per level</Text>

        {quizPoints.values.length === 0 ? (
          <Text style={styles.empty}>No quiz data yet.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              width={Math.max(chartW, quizPoints.values.length * 70)}
              height={240}
              data={{
                labels: quizPoints.labels,
                datasets: [{ data: quizPoints.values }],
              }}
              fromZero
              bezier
              yAxisInterval={1}
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </ScrollView>
        )}
      </View>

      {/* Projects by month */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Projects by month</Text>

        {projectsMonthly.values.length === 0 ? (
          <Text style={styles.empty}>No projects data yet.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              width={Math.max(chartW, projectsMonthly.values.length * 70)}
              height={240}
              data={{
                labels: projectsMonthly.labels,
                datasets: [{ data: projectsMonthly.values }],
              }}
              fromZero
              showValuesOnTopOfBars
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </ScrollView>
        )}
      </View>

      {/* Logins last 30 days */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Logins (last 30 days)</Text>

        {logins30.values.length === 0 ? (
          <Text style={styles.empty}>No login data yet.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              width={Math.max(chartW, logins30.values.length * 30)}
              height={240}
              data={{
                labels: logins30.labels,
                datasets: [{ data: logins30.values }],
              }}
              fromZero
              bezier
              yAxisInterval={1}
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
}

function KpiCard({ label, value }) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value ?? "—"}</Text>
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
  propsForDots: { r: "4" },
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff7ed", padding: 14 },
  h1: { fontSize: 18, fontWeight: "900", color: "#9d174d", marginBottom: 10 },

  errBox: {
    color: "#b91c1c",
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 12,
    borderRadius: 14,
  },

  kpiGrid: { gap: 10 },
  kpiCard: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fde047",
    borderRadius: 18,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiLabel: { fontSize: 12, color: "#64748b" },
  kpiValue: { marginTop: 4, fontSize: 20, fontWeight: "900", color: "#be185d" },

  card: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fde047",
    borderRadius: 18,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontWeight: "800", marginBottom: 8, color: "#0f172a" },
  empty: { color: "#64748b", fontSize: 12, paddingVertical: 6 },
  chart: { borderRadius: 14 },
});
