// frontend/src/admin-front/src/AdminStudentAnalytics.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStudentAnalytics } from "./AdminApi";
// AdminStudentAnalytics.jsx
import { getAnalyticsUser } from "./AdminApi";

import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, ResponsiveContainer } from "recharts";

export default function AdminStudentAnalytics(){
  const { userId } = useParams();
  const [data,setData]=useState(null);
  const [err,setErr]=useState("");

  useEffect(()=>{ (async()=>{
    try{ setData(await getStudentAnalytics(userId)); }catch(e){ setErr(e.message||"failed"); }
  })(); },[userId]);

  if(err) return <div className="p-3 bg-red-50 text-red-700 rounded">{err}</div>;
  if(!data) return <div>Loading…</div>;

  const u = data.user;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-pink-700">Student Analytics — {u.name} ({u.email})</h1>

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
          <div className="text-sm text-slate-500">Projects total</div>
          <div className="text-2xl font-black text-pink-700">{data.summary.projects_total}</div>
        </div>
        <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
          <div className="text-sm text-slate-500">Quiz attempts</div>
          <div className="text-2xl font-black text-pink-700">{data.summary.quiz_attempts}</div>
        </div>
        <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
          <div className="text-sm text-slate-500">Quiz pass rate</div>
          <div className="text-2xl font-black text-pink-700">{data.summary.quiz_pass_rate}%</div>
        </div>
      </div>

      {/* Quiz by level (score) */}
      <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
        <div className="font-bold mb-2">Quiz scores per level</div>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={data.charts.quizzes.map(q=>({ 
              level: `${q.topic}-${q.level_number}`, score: q.score 
            }))}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="level"/>
              <YAxis allowDecimals={false}/>
              <Tooltip/>
              <Line type="monotone" dataKey="score" stroke="#ec4899" strokeWidth={2}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projects per month */}
      <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
        <div className="font-bold mb-2">Projects by month</div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={data.charts.projectsMonthly.map(r=>({ month: r.ym.slice(0,7), count: r.c }))}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="month"/>
              <YAxis allowDecimals={false}/>
              <Tooltip/>
              <Bar dataKey="count" fill="#10b981"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Logins last 30 days */}
      <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
        <div className="font-bold mb-2">Logins (last 30 days)</div>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={data.charts.logins30}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="day"/>
              <YAxis allowDecimals={false}/>
              <Tooltip/>
              <Line type="monotone" dataKey="cnt" stroke="#3b82f6" strokeWidth={2}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
