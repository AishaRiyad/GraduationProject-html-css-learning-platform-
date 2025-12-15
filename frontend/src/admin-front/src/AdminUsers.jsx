// frontend/src/admin-front/src/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  patchUserRole,
  patchUserStatus,
  resetUserPassword,
} from "./AdminApi";

const empty = { id:null, name:"", email:"", role:"student", level:"basic", active:1 };

export default function AdminUsers(){
  const [rows,setRows]=useState([]);
  const [q,setQ]=useState(""); 
  const [role,setRole]=useState(""); 
  const [level,setLevel]=useState("");
  const [details,setDetails]=useState(null);
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState(empty);
  const [err,setErr]=useState("");

  async function load() {
    setErr("");
    try {
      const data = await listUsers({ search:q, role, level });
      setRows(Array.isArray(data) ? data : []);
    } catch(e) {
      console.error(e);
      setErr(e.message || "Failed to load users");
      alert(e.message || "Failed to load users");
    }
  }

  useEffect(()=>{ load(); /* eslint-disable-next-line */},[]);

  function openCreate(){ setForm(empty); setModal(true); }
  function openEdit(u){ setForm({...u}); setModal(true); }

  async function save(){
    setErr("");
    try{
      if(form.id){
        await updateUser(form.id, form);
      }else{
        await createUser({ ...form, password:"admin123" });
      }
      setModal(false); load();
    }catch(e){
      console.error(e); setErr(e.message||"Save failed"); alert(e.message||"Save failed");
    }
  }

  async function remove(id){
    // eslint-disable-next-line no-restricted-globals
    if(!confirm("Delete user?")) return;
    try{
      await deleteUser(id);
      load();
    }catch(e){
      console.error(e); setErr(e.message||"Delete failed"); alert(e.message||"Delete failed");
    }
  }

  async function toggleRole(u){
    const newRole = u.role === "student" ? "supervisor" : "student";
    try { await patchUserRole(u.id, newRole); load(); }
    catch(e){ console.error(e); alert(e.message||"Role update failed"); }
  }

  async function deactivate(u){
    try { await patchUserStatus(u.id, 0); load(); }
    catch(e){ console.error(e); alert(e.message||"Status update failed"); }
  }

  async function doReset(u){
    try {
      const x = await resetUserPassword(u.id);
      alert(`Temporary password for ${u.email}: ${x.new_password || x.token || "(server returned no value)"}`);
    } catch(e){
      console.error(e); alert(e.message||"Reset failed");
    }
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-black text-pink-700">Users</h1>

      {err && <div className="p-2 rounded bg-red-50 text-red-700 border border-red-200">{err}</div>}

      <div className="flex gap-2">
        <input className="input-soft" placeholder="Search name/email" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="input-soft" value={role} onChange={e=>setRole(e.target.value)}>
          <option value="">All roles</option>
          <option>student</option><option>supervisor</option><option>admin</option><option>teacher</option>
        </select>
        <select className="input-soft" value={level} onChange={e=>setLevel(e.target.value)}>
          <option value="">All levels</option>
          <option>basic</option><option>advanced</option>
        </select>
        <button className="btn btn-emerald" onClick={load}>Filter</button>
        <button className="btn" onClick={openCreate}>+ New</button>
      </div>

      <div className="overflow-auto rounded-2xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-yellow-100">
            <tr><th className="p-2 text-left">Name</th><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Level</th><th className="p-2">Last login</th><th className="p-2">Actions</th></tr>
          </thead>
          <tbody>
          {rows.map(r=> (
            <tr key={r.id} className="odd:bg-white even:bg-yellow-50">
              <td className="p-2 font-semibold">{r.name}</td>
              <td className="p-2">{r.email}</td>
              <td className="p-2">{r.role}</td>
              <td className="p-2">{r.level}</td>
              <td className="p-2">{r.last_login?.slice(0,19).replace('T',' ')||"-"}</td>
              <td className="p-2 flex gap-2">
                <button className="btn" onClick={async()=>setDetails(await getUser(r.id))}>Details</button>
                <button className="btn" onClick={()=>toggleRole(r)}>Toggle Role</button>
                <button className="btn" onClick={()=>deactivate(r)}>Deactivate</button>
                <button className="btn" onClick={()=>doReset(r)}>Reset PW</button>
                <button className="btn !bg-red-50 !text-red-700" onClick={()=>remove(r.id)}>Delete</button>
                <button className="btn" onClick={()=>openEdit(r)}>Edit</button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit user modal */}
      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="result-card fancy-pop" onClick={e=>e.stopPropagation()}>
            <div className="result-title">{form.id ? "Edit user" : "Create user"}</div>
            <div className="grid gap-2 mt-2">
              <input className="input-soft" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
              <input className="input-soft" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
              <select className="input-soft" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                <option>student</option><option>supervisor</option><option>admin</option><option>teacher</option>
              </select>
              <select className="input-soft" value={form.level} onChange={e=>setForm({...form,level:e.target.value})}>
                <option>basic</option><option>advanced</option>
              </select>
              <label className="text-xs">
                <input type="checkbox" checked={!!form.active} onChange={e=>setForm({...form,active:e.target.checked?1:0})}/>
                <span className="ml-2">Active</span>
              </label>
              <div className="flex gap-2 mt-2">
                <button className="btn btn-emerald" onClick={save}>Save</button>
                <button className="btn" onClick={()=>setModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple user details modal */}
      {details && (
        <div className="modal-overlay" onClick={()=>setDetails(null)}>
          <div className="result-card fancy-pop" onClick={e=>e.stopPropagation()}>
            <div className="result-title">User Details</div>
            <pre className="text-left whitespace-pre-wrap text-sm mt-2">{JSON.stringify(details, null, 2)}</pre>
            <button className="btn back-btn" onClick={()=>setDetails(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
