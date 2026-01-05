import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "http://10.0.2.2:5000/api/admin";

async function authHeaders() {
  const t = await AsyncStorage.getItem("token");
  return t ? { Authorization: t.startsWith("Bearer ") ? t : `Bearer ${t}` } : {};
}

export default function AdminDashboardMobile() {
  const [overview, setOverview] = useState(null);
  const [recent, setRecent] = useState({
    latestUsers: [],
    latestProjects: [],
    latestComments: [],
  });
  const [error, setError] = useState("");

  async function getOverview() {
    const res = await fetch(`${API}/overview`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`overview HTTP ${res.status}`);
    return res.json();
  }

  async function getRecent() {
    const res = await fetch(`${API}/recent`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`recent HTTP ${res.status}`);
    const data = await res.json();

    const latestUsers = Array.isArray(data?.latestUsers) ? data.latestUsers : [];
    const latestProjects = Array.isArray(data?.latestProjects) ? data.latestProjects : [];
    const latestComments = Array.isArray(data?.latestComments) ? data.latestComments : [];

    return { latestUsers, latestProjects, latestComments };
  }

  useEffect(() => {
    (async () => {
      try {
        const [ov, rc] = await Promise.all([getOverview(), getRecent()]);
        setOverview(ov);
        setRecent(rc);
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed loading dashboard");
      }
    })();
  }, []);

  const fmt = (d) => (d ? String(d).replace("T", " ").slice(0, 19) : "");

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Admin Dashboard</Text>

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.kpiGrid}>
        <KpiCard label="Users" value={overview?.users ?? "—"} />
        <KpiCard label="Students" value={overview?.students ?? "—"} />
        <KpiCard label="Projects" value={overview?.projects ?? "—"} />
        <KpiCard label="Comments" value={overview?.comments ?? "—"} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Latest Users</Text>
        {recent.latestUsers.length === 0 ? (
          <Text style={styles.emptyText}>No users yet</Text>
        ) : (
          recent.latestUsers.map((u) => (
            <View key={u.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{u.name || "(no name)"}</Text>
              <Text style={styles.itemSub}>{u.email}</Text>
              <Text style={styles.itemMeta}>{fmt(u.created_at)}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Latest Projects</Text>
        {recent.latestProjects.length === 0 ? (
          <Text style={styles.emptyText}>No projects</Text>
        ) : (
          recent.latestProjects.map((p) => (
            <View key={p.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{p.title || "(no title)"}</Text>
              <Text style={styles.itemMeta}>{fmt(p.created_at)}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Latest Comments</Text>
        {recent.latestComments.length === 0 ? (
          <Text style={styles.emptyText}>No comments</Text>
        ) : (
          recent.latestComments.map((c) => (
            <View key={c.id} style={styles.itemCard}>
              <Text style={styles.itemBody}>{c.comment}</Text>
              <Text style={styles.itemMeta}>{fmt(c.created_at)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function KpiCard({ label, value }) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{String(value)}</Text>
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
  errorBox: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 12,
  },
  errorText: {
    color: "#b91c1c",
    fontWeight: "700",
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  kpiCard: {
    width: "48%",
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
    fontSize: 26,
    fontWeight: "900",
    color: "#0f172a",
  },
  section: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fde047",
    backgroundColor: "#fff",
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 10,
  },
  emptyText: {
    color: "#64748b",
  },
  itemCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 10,
    marginTop: 8,
    backgroundColor: "#fff",
  },
  itemTitle: {
    fontWeight: "800",
    color: "#0f172a",
  },
  itemBody: {
    color: "#0f172a",
  },
  itemSub: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  itemMeta: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 4,
  },
});
