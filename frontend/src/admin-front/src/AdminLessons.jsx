import React, { useEffect, useState } from "react";
import { listLessons, createLesson, updateLesson, deleteLesson, validateLessonJSON } from "./AdminApi";

export default function AdminLessons(){
  const [rows,setRows]=useState([]);
  const [level,setLevel]=useState("basic");
  const [form,setForm]=useState({ title:"", lesson_order:1, level:"basic", content_file:"" });

  const load=async()=> setRows(await listLessons({ level }));
  useEffect(()=>{ load(); },[level]);

  const onSave=async()=>{
    if(!form.title) return;
    if(form.id){
      await updateLesson(form.id, form);
    }else{
      await createLesson(form);
    }
    setForm({ title:"", lesson_order:1, level, content_file:""});
    load();
  };

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-black text-pink-700">Lessons (HTML)</h1>

      <div className="flex gap-2">
        <select className="input-soft" value={level} onChange={e=>setLevel(e.target.value)}>
          <option>basic</option><option>advanced</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
          <div className="font-bold mb-2">Create / Update</div>
          <div className="grid gap-2">
            <input className="input-soft" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            <input className="input-soft" placeholder="Order" type="number" value={form.lesson_order} onChange={e=>setForm({...form,lesson_order:Number(e.target.value)})}/>
            <select className="input-soft" value={form.level} onChange={e=>setForm({...form,level:e.target.value})}>
              <option>basic</option><option>advanced</option>
            </select>
            <input className="input-soft" placeholder="content_file (e.g. basic_1.json)" value={form.content_file} onChange={e=>setForm({...form,content_file:e.target.value})}/>
            <div className="flex gap-2">
              <button className="btn btn-emerald" onClick={onSave}>Save</button>
              {form.id && <button className="btn" onClick={()=>setForm({ title:"", lesson_order:1, level, content_file:""})}>Cancel</button>}
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
                  <div className="text-xs text-slate-500">order {r.lesson_order} • {r.level} • {r.content_file}</div>
                </div>
                <div className="flex gap-2">
                  <button className="btn" onClick={()=>setForm(r)}>Edit</button>
                  <button className="btn" onClick={async()=>{ await validateLessonJSON(r.id); alert("JSON OK"); }}>Validate</button>
                  <button className="btn" onClick={async()=>{ await deleteLesson(r.id); load(); }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
