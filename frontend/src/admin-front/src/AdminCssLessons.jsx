import React, { useEffect, useState } from "react";
import { listCssLessons, createCssLesson, updateCssLesson, deleteCssLesson, validateCssJSON } from "./AdminApi";


export default function AdminCssLessons(){
const [rows,setRows]=useState([]); const [form,setForm]=useState({ title:"", order_index:1, json_path:"css_1.json" });
const load=async()=> setRows(await listCssLessons());
useEffect(()=>{ load(); },[]);
const onSave=async()=>{ if(!form.title) return; await createCssLesson(form); setForm({ title:"", order_index:1, json_path:"css_1.json" }); load(); };
return (
<div className="space-y-3">
<h1 className="text-2xl font-black text-pink-700">CSS Lessons</h1>
<div className="grid md:grid-cols-2 gap-3">
<div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
<div className="font-bold mb-2">Create / Update</div>
<div className="grid gap-2">
<input className="input-soft" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
<input className="input-soft" placeholder="Order index" type="number" value={form.order_index} onChange={e=>setForm({...form,order_index:Number(e.target.value)})}/>
<input className="input-soft" placeholder="json_path (e.g. css_1.json)" value={form.json_path} onChange={e=>setForm({...form,json_path:e.target.value})}/>
<div className="flex gap-2">
<button className="btn btn-emerald" onClick={onSave}>Save</button>
</div>
</div>
</div>
<div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
<div className="font-bold mb-2">List</div>
<ul className="space-y-2">
{rows.map(r=> (
<li key={r.id} className="border rounded-xl p-2 flex items-center justify-between gap-2">
<div>
<div className="font-semibold">{r.title}</div>
<div className="text-xs text-slate-500">order {r.order_index} • {r.json_path}</div>
</div>
<div className="flex gap-2">
<button className="btn" onClick={()=>setForm(r)}>Edit</button>
<button className="btn" onClick={async()=>{ await validateCssJSON(r.id); alert("JSON OK"); }}>Validate</button>
<button className="btn" onClick={async()=>{ await deleteCssLesson(r.id); load(); }}>Delete</button>
</div>
</li>
))}
</ul>
</div>
</div>
</div>
);
}