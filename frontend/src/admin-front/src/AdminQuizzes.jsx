// admin-front/src/AdminQuizzes.jsx
import React, { useEffect, useState } from "react";
import {
  adminListQuizLevels as listLevels,
  adminCreateQuizLevel as createLevel,
  adminUpdateQuizLevel as updateLevel,
  adminDeleteQuizLevel as deleteLevel,
  adminListQuestions as listQuestions,
  adminCreateQuestion as createQuestion,
  adminUpdateQuestion as updateQuestion,
  adminDeleteQuestion as deleteQuestion,
} from "./AdminQuizzesApi";

const emptyLevel = { id:null, level_number: 1, title: "", description: "", pass_threshold: 6 };

const emptyQ = {
  id: null,
  q_type: "MC",            // "MC" or "TF"
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "a",     // a|b|c|d (used when q_type = "MC")
  tf_answer: 1,            // 1 or 0  (used when q_type = "TF")
  explanation: "",
};

export default function AdminQuizzes(){
  const [topic,setTopic]=useState("html");
  const [levels,setLevels]=useState([]);
  const [selected,setSelected]=useState(null);

  const [levelForm,setLevelForm]=useState(emptyLevel);
  const [qs,setQs]=useState([]);
  const [qForm,setQForm]=useState(emptyQ);

  const [saving,setSaving]=useState(false);

  async function loadLevels(){
    const data = await listLevels(topic);
    setLevels(data || []);
    if (selected) {
      const f = (data||[]).find(l=>l.id===selected.id);
      if (!f) { setSelected(null); setQs([]); }
    }
  }
  async function loadQs(lid){
    const data = await listQuestions(lid);
    // Normalize API question rows into the frontend shape
    const mapped = (data||[]).map(row=>{
      if (row.q_type === "TF") {
        return {
          id: row.id,
          q_type: "TF",
          question_text: row.text || "",
          option_a: "", option_b: "", option_c: "", option_d: "",
          correct_option: "a",
          tf_answer: row.tf_answer ? 1 : 0,
          explanation: "",
        };
      } else {
        const opts = Array.isArray(row.options_json) ? row.options_json : JSON.parse(row.options_json||"[]");
        const a = opts[0] || "", b = opts[1] || "", c = opts[2] || "", d = opts[3] || "";
        const idx = typeof row.correct_index === "number" ? row.correct_index : 0;
        const idx2opt = ["a","b","c","d"][idx] || "a";
        return {
          id: row.id,
          q_type: "MC",
          question_text: row.text || "",
          option_a: a, option_b: b, option_c: c, option_d: d,
          correct_option: idx2opt,
          tf_answer: 1,
          explanation: "",
        };
      }
    });
    setQs(mapped);
  }

  useEffect(()=>{ loadLevels(); },[topic]);

  // ===== Levels CRUD =====
  function openCreateLevel(){ setLevelForm({...emptyLevel}); }
  function openEditLevel(l){ setLevelForm({ id:l.id, level_number:l.level_number, title:l.title, description:l.description||"", pass_threshold:l.pass_threshold }); }
  async function onSaveLevel(){
    setSaving(true);
    try{
      if (levelForm.id){
        await updateLevel(topic, levelForm.id, levelForm);
      } else {
        await createLevel(topic, levelForm);
      }
      setLevelForm(emptyLevel);
      await loadLevels();
    } finally { setSaving(false); }
  }
  async function onDeleteLevel(id){
    // eslint-disable-next-line no-restricted-globals
    if(!confirm("Delete this level?")) return;
    await deleteLevel(topic, id);
    if(selected?.id===id){ setSelected(null); setQs([]); }
    await loadLevels();
  }
  function openLevel(l){
    setSelected(l);
    setQForm({...emptyQ});
    loadQs(l.id);
  }

  // ===== Questions CRUD =====
  function editQ(q){ setQForm({...q}); }
  function newQ(){ setQForm({...emptyQ}); }

  function buildQuestionPayload(form){
    if (form.q_type === "TF"){
      return {
        text: form.question_text,
        q_type: "TF",
        tf_answer: form.tf_answer ? 1 : 0,
        options_json: [],
        correct_index: 0,
      };
    }
    const opts = [form.option_a, form.option_b, form.option_c, form.option_d];
    const map = { a:0, b:1, c:2, d:3 };
    return {
      text: form.question_text,
      q_type: "MC",
      tf_answer: 0,
      options_json: opts,
      correct_index: map[form.correct_option] ?? 0,
    };
  }

  async function saveQ(){
    if(!selected?.id) return alert("Select a level first.");
    const payload = buildQuestionPayload(qForm);
    setSaving(true);
    try{
      if (qForm.id){
        await updateQuestion(qForm.id, payload);
      }else{
        await createQuestion(selected.id, payload);
      }
      setQForm({...emptyQ});
      await loadQs(selected.id);
    } finally { setSaving(false); }
  }
  async function deleteQ(id){
    // eslint-disable-next-line no-restricted-globals
    if(!confirm("Delete this question?")) return;
    await deleteQuestion(id);
    await loadQs(selected.id);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-pink-700">Quizzes</h1>

      <div className="flex gap-2 items-center">
        <select className="input-soft" value={topic} onChange={e=>{setTopic(e.target.value); setSelected(null); setQs([]);}}>
          <option value="html">html</option>
          <option value="css">css</option>
        </select>
        <button className="btn" onClick={loadLevels}>Reload</button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {/* Levels */}
        <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
          <div className="font-bold mb-2">Levels</div>

          <div className="border rounded-xl p-3 mb-3 bg-yellow-50">
            <div className="font-semibold mb-1">{levelForm.id ? "Edit level" : "Create level"}</div>
            <div className="grid gap-2">
              <input className="input-soft" type="number" min="1"
                value={levelForm.level_number}
                onChange={e=>setLevelForm({...levelForm, level_number:Number(e.target.value)})}
                placeholder="Level number" />
              <input className="input-soft" value={levelForm.title}
                onChange={e=>setLevelForm({...levelForm, title:e.target.value})}
                placeholder="Title" />
              <textarea className="input-soft" rows={2}
                value={levelForm.description}
                onChange={e=>setLevelForm({...levelForm, description:e.target.value})}
                placeholder="Description" />
              <input className="input-soft" type="number" min="1"
                value={levelForm.pass_threshold}
                onChange={e=>setLevelForm({...levelForm, pass_threshold:Number(e.target.value)})}
                placeholder="Pass threshold" />
              <div className="flex gap-2">
                <button className="btn btn-emerald" onClick={onSaveLevel} disabled={saving}>{saving?"Saving...":"Save"}</button>
                <button className="btn" onClick={()=>setLevelForm(emptyLevel)} disabled={saving}>Clear</button>
              </div>
            </div>
          </div>

          <ul className="space-y-2">
            {levels.map(l => (
              <li key={l.id} className={`p-2 border rounded-xl ${selected?.id===l.id?"bg-yellow-50":""}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">#{l.level_number || l.id} — {l.title}</div>
                    <div className="text-xs text-slate-500">pass ≥ {l.pass_threshold}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn" onClick={()=>openLevel(l)}>Open</button>
                    <button className="btn" onClick={()=>openEditLevel(l)}>Edit</button>
                    <button className="btn !bg-red-50 !text-red-700" onClick={()=>onDeleteLevel(l.id)}>Delete</button>
                  </div>
                </div>
              </li>
            ))}
            {levels.length===0 && (
              <li className="text-sm text-slate-500">
                No levels for this topic yet.
              </li>
            )}
          </ul>
        </div>

        {/* Questions */}
        <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
          <div className="font-bold mb-2">Questions</div>
          {!selected && (
            <div className="text-slate-500 text-sm">
              Select a level from the left to show its questions.
            </div>
          )}

          {selected && (
            <>
              <div className="border rounded-xl p-3 mb-3 bg-yellow-50">
                <div className="font-semibold mb-1">{qForm.id ? "Edit question" : "Create question"}</div>
                <div className="grid gap-2">
                  <select className="input-soft w-40"
                    value={qForm.q_type}
                    onChange={e=>setQForm({...qForm, q_type:e.target.value})}>
                    <option value="MC">Multiple Choice</option>
                    <option value="TF">True/False</option>
                  </select>

                  <textarea className="input-soft" rows={2} placeholder="Question text"
                    value={qForm.question_text} onChange={e=>setQForm({...qForm, question_text:e.target.value})} />

                  {qForm.q_type === "MC" ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <input className="input-soft" placeholder="Option A" value={qForm.option_a} onChange={e=>setQForm({...qForm, option_a:e.target.value})}/>
                        <input className="input-soft" placeholder="Option B" value={qForm.option_b} onChange={e=>setQForm({...qForm, option_b:e.target.value})}/>
                        <input className="input-soft" placeholder="Option C" value={qForm.option_c} onChange={e=>setQForm({...qForm, option_c:e.target.value})}/>
                        <input className="input-soft" placeholder="Option D" value={qForm.option_d} onChange={e=>setQForm({...qForm, option_d:e.target.value})}/>
                      </div>
                      <select className="input-soft w-40" value={qForm.correct_option} onChange={e=>setQForm({...qForm, correct_option:e.target.value})}>
                        <option value="a">Correct: A</option>
                        <option value="b">Correct: B</option>
                        <option value="c">Correct: C</option>
                        <option value="d">Correct: D</option>
                      </select>
                    </>
                  ) : (
                    <select className="input-soft w-40" value={qForm.tf_answer} onChange={e=>setQForm({...qForm, tf_answer: Number(e.target.value)})}>
                      <option value={1}>True</option>
                      <option value={0}>False</option>
                    </select>
                  )}

                  <textarea className="input-soft" rows={2} placeholder="Explanation (optional)"
                    value={qForm.explanation} onChange={e=>setQForm({...qForm, explanation:e.target.value})} />
                  <div className="flex gap-2">
                    <button className="btn btn-emerald" onClick={saveQ} disabled={saving}>{saving?"Saving...":"Save"}</button>
                    <button className="btn" onClick={newQ} disabled={saving}>Clear</button>
                  </div>
                </div>
              </div>

              <ul className="space-y-2">
                {qs.map(q=>(
                  <li key={q.id} className="p-2 border rounded-xl">
                    <div className="flex justify-between gap-2">
                      <div className="text-sm">
                        <div className="font-semibold">{q.question_text}</div>
                        {q.q_type === "TF" ? (
                          <div className="text-xs text-slate-500">Type: True/False — Answer: <b>{q.tf_answer ? "True" : "False"}</b></div>
                        ) : (
                          <div className="text-xs text-slate-500">
                            A) {q.option_a} • B) {q.option_b} • C) {q.option_c} • D) {q.option_d} — Correct: <b>{(q.correct_option||"").toUpperCase()}</b>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button className="btn" onClick={()=>editQ(q)}>Edit</button>
                        <button className="btn !bg-red-50 !text-red-700" onClick={()=>deleteQ(q.id)}>Delete</button>
                      </div>
                    </div>
                  </li>
                ))}
                {qs.length===0 && (
                  <li className="text-sm text-slate-500">
                    No questions for this level yet.
                  </li>
                )}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
