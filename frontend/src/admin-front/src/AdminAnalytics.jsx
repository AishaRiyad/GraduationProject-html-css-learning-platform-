// frontend/src/admin-front/src/AdminAnalytics.jsx
import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Legend
} from "recharts";
import { getAnalyticsOverview, listAnalyticsUsers } from "./AdminApi";

export default function AdminAnalytics(){
  const [data,setData]=useState(null);
  const [err,setErr]=useState("");

  useEffect(()=>{ (async()=>{
    try{ setData(await getAnalyticsOverview()); }catch(e){ setErr(e.message||"failed"); }
  })(); },[]);

  if(err) return <div className="p-3 bg-red-50 text-red-700 rounded">{err}</div>;
  if(!data) return <div>Loading…</div>;

  const colors = ["#f59e0b","#ec4899","#10b981","#3b82f6","#a78bfa"];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-pink-700">Analytics Overview</h1>

      {/* KPIs */}
      <div className="grid md:grid-cols-4 gap-3">
        {Object.entries(data.kpi).map(([k,v],i)=>(
          <div key={k} className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
            <div className="text-sm text-slate-500">{k}</div>
            <div className="text-2xl font-black text-pink-700">{v}</div>
          </div>
        ))}
      </div>

      {/* Logins 30 days (daily total) */}
      <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
        <div className="font-bold mb-2">Logins (last 30 days)</div>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={data.logins30}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="logins" stroke="#ec4899" strokeWidth={2}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Logins by user (30 days) */}
      <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
        <div className="font-bold mb-2">Logins by user (last 30 days)</div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={data.loginsByUser30}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="logins" fill="#a78bfa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top students by projects */}
      <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
        <div className="font-bold mb-2">Top students by projects</div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={data.topByProjects}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="projects" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top students by quiz (passes + pass_rate) */}
      <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
        <div className="font-bold mb-2">Top students by quiz</div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={data.topByQuiz}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="passes" name="Passes" fill="#3b82f6" />
              <Bar dataKey="pass_rate" name="Pass Rate (%)" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

       
      <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
        <div className="font-bold mb-2">
          Supervisor Ratings (from Students)
        </div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={data.supervisorRatings || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="supervisor_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg_overall" name="Avg Rating" fill="#ec4899" />
              <Bar dataKey="total_reviews" name="Reviews" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      
      <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
        <div className="font-bold mb-2">
          Student Ratings (from Supervisors)
        </div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={data.studentRatings || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="student_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg_overall" name="Avg Rating" fill="#3b82f6" />
              <Bar dataKey="total_reviews" name="Reviews" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Roles distribution */}
      <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
        <div className="font-bold mb-2">Roles distribution</div>
        <div className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data.roles} dataKey="c" nameKey="role" outerRadius={100} label>
                {data.roles.map((_,i)=><Cell key={i} fill={colors[i % colors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top students (activity) */}
      <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
        <div className="font-bold mb-2">Top students (activity)</div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={data.topStudents}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="projects" fill="#10b981" />
              <Bar dataKey="logins" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
