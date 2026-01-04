import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { getSocket } from "../../socket";

const API = "http://localhost:5000";
const GROUP_API = `${API}/api/chat-groups`;

function authHeaders(extra = {}) {
  const t = localStorage.getItem("token");
  const auth = t ? (t.startsWith("Bearer ") ? t : `Bearer ${t}`) : null;
  return { ...extra, ...(auth ? { Authorization: auth } : {}) };
}

export default function SupervisorGroups({ supervisorId }) {
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);

  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [rec, setRec] = useState(null);
  const chunksRef = useRef([]);
  const endRef = useRef(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [picked, setPicked] = useState({});

  const [addOpen, setAddOpen] = useState(false);
  const [addPicked, setAddPicked] = useState({});
  const [adding, setAdding] = useState(false);

  const [manageOpen, setManageOpen] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const selectedGroupRef = useRef(null);
  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
  }, [selectedGroup]);

  const effectiveSupervisorId = useMemo(() => {
    if (supervisorId) return Number(supervisorId);
    try {
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : null;
      return u?.id ? Number(u.id) : null;
    } catch {
      return null;
    }
  }, [supervisorId]);

  const isOwnerSupervisor =
    selectedGroup && Number(selectedGroup.supervisor_id) === Number(effectiveSupervisorId);

  const scrollBottom = () => endRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    loadGroups();
    loadStudents();
  }, [effectiveSupervisorId]);

  useEffect(() => {
    scrollBottom();
  }, [messages]);

  async function loadGroups() {
    try {
      setLoadingGroups(true);
      const res = await axios.get(`${GROUP_API}/mine`, { headers: authHeaders() });
      setGroups(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  }

  async function loadStudents() {
    try {
      setLoadingStudents(true);
      const res = await axios.get(`${API}/api/supervisor-chat/students`, {
        params: { supervisorId: effectiveSupervisorId || undefined },
        headers: authHeaders(),
      });
      setStudents(res.data?.students || []);
    } catch (e) {
      console.error(e);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }

  async function openGroup(groupId) {
    setSelectedGroup(null);
    setGroupMembers([]);
    setMessages([]);
    setText("");
    setFile(null);

    try {
      setLoadingMsgs(true);

      const s = getSocket();
      if (s) s.emit("group:join", { groupId });

      const info = await axios.get(`${GROUP_API}/${groupId}`, { headers: authHeaders() });
      setSelectedGroup(info.data?.group || null);
      setGroupMembers(info.data?.members || []);

      const msgs = await axios.get(`${GROUP_API}/${groupId}/messages`, {
        headers: authHeaders(),
      });
      setMessages(Array.isArray(msgs.data) ? msgs.data : []);
    } catch (e) {
      console.error(e);
      alert("Failed to open group.");
    } finally {
      setLoadingMsgs(false);
    }
  }

  async function deleteGroup(groupId) {
    if (!window.confirm("Delete this group?")) return;

    try {
      await axios.delete(`${GROUP_API}/${groupId}`, { headers: authHeaders() });

      if (selectedGroupRef.current?.id === groupId) {
        setSelectedGroup(null);
        setGroupMembers([]);
        setMessages([]);
        setText("");
        setFile(null);
      }

      await loadGroups();
    } catch (e) {
      console.error(e);
      alert("Failed to delete group.");
    }
  }

  async function deleteGroupMessage(messageId) {
    if (!selectedGroupRef.current?.id) return;
    if (!window.confirm("Delete this message?")) return;

    const groupId = selectedGroupRef.current.id;

    try {
      await axios.delete(`${GROUP_API}/${groupId}/messages/${messageId}`, {
        headers: authHeaders(),
      });

      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (e) {
      console.error(e);
      alert("Failed to delete message.");
    }
  }

  async function removeMember(userId) {
    if (!selectedGroup?.id) return;
    if (!window.confirm("Remove this member from group?")) return;

    try {
      setRemovingId(userId);
      const res = await axios.delete(`${GROUP_API}/${selectedGroup.id}/members/${userId}`, {
        headers: authHeaders(),
      });
      setGroupMembers(res.data?.members || []);
      await loadGroups();
    } catch (e) {
      console.error(e);
      alert("Failed to remove member.");
    } finally {
      setRemovingId(null);
    }
  }

  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const onNew = (msg) => {
      const gid = Number(msg?.group_id);
      if (!gid) return;
      const current = selectedGroupRef.current;
      if (!current || Number(current.id) !== gid) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const onDeleted = ({ groupId }) => {
      setGroups((prev) => prev.filter((g) => Number(g.id) !== Number(groupId)));
      const current = selectedGroupRef.current;
      if (current && Number(current.id) === Number(groupId)) {
        setSelectedGroup(null);
        setGroupMembers([]);
        setMessages([]);
        setText("");
        setFile(null);
      }
    };

    const onMsgDeleted = ({ groupId, messageId }) => {
      const current = selectedGroupRef.current;
      if (!current || Number(current.id) !== Number(groupId)) return;
      setMessages((prev) => prev.filter((m) => Number(m.id) !== Number(messageId)));
    };

    const onMembersChanged = ({ groupId }) => {
      const current = selectedGroupRef.current;
      if (current && Number(current.id) === Number(groupId)) {
        openGroup(groupId);
      } else {
        loadGroups();
      }
    };

    const onRemoved = ({ groupId }) => {
      const current = selectedGroupRef.current;
      if (current && Number(current.id) === Number(groupId)) {
        setSelectedGroup(null);
        setGroupMembers([]);
        setMessages([]);
        setText("");
        setFile(null);
      }
      loadGroups();
    };

    s.on("group:newMessage", onNew);
    s.on("group:deleted", onDeleted);
    s.on("group:messageDeleted", onMsgDeleted);
    s.on("group:membersChanged", onMembersChanged);
    s.on("group:removed", onRemoved);

    return () => {
      s.off("group:newMessage", onNew);
      s.off("group:deleted", onDeleted);
      s.off("group:messageDeleted", onMsgDeleted);
      s.off("group:membersChanged", onMembersChanged);
      s.off("group:removed", onRemoved);
    };
  }, []);

  async function startRecord() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const voiceFile = new File([blob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
        setFile(voiceFile);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setRec(mr);
    } catch (e) {
      console.error(e);
      alert("Mic permission required.");
    }
  }

  function stopRecord() {
    try {
      rec?.stop();
    } catch {}
    setRec(null);
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!selectedGroup) return;

    const body = text.trim();
    if (!body && !file) return;

    try {
      let res;

      if (file) {
        const fd = new FormData();
        fd.append("body", body);
        fd.append("file", file);
        res = await axios.post(`${GROUP_API}/${selectedGroup.id}/messages`, fd, {
          headers: authHeaders(),
        });
      } else {
        res = await axios.post(
          `${GROUP_API}/${selectedGroup.id}/messages`,
          { body },
          { headers: authHeaders({ "Content-Type": "application/json" }) }
        );
      }

      const msg = res.data;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      setText("");
      setFile(null);
    } catch (e2) {
      console.error(e2);
      alert("Failed to send group message.");
    }
  }

  function renderMessage(m) {
    const url = m?.file_url ? `${API}${m.file_url}` : null;

    if (m?.message_type === "image" && url) {
      return <img src={url} alt={m.file_name || "image"} className="max-w-[260px] rounded-xl" />;
    }
    if (m?.message_type === "audio" && url) {
      return <audio controls src={url} className="w-[260px]" />;
    }
    if (m?.message_type === "file" && url) {
      return (
        <a href={url} target="_blank" rel="noreferrer" className="underline text-sm">
          {m.file_name || "Download file"}
        </a>
      );
    }
    return <div className="whitespace-pre-wrap">{m.body}</div>;
  }

  async function createGroup() {
    const name = newName.trim();
    if (!name) return;

    const memberIds = Object.keys(picked)
      .filter((k) => picked[k])
      .map((k) => Number(k))
      .filter(Boolean);

    try {
      const res = await axios.post(
        GROUP_API,
        { name, memberIds },
        { headers: authHeaders({ "Content-Type": "application/json" }) }
      );

      setCreateOpen(false);
      setNewName("");
      setPicked({});
      await loadGroups();

      const g = res.data;
      if (g?.id) openGroup(g.id);
    } catch (e) {
      console.error(e);
      alert("Failed to create group.");
    }
  }

  function openAddMembersModal() {
    setAddPicked({});
    setAddOpen(true);
  }

  async function addMembers() {
    if (!selectedGroup?.id) return;

    const memberIds = Object.keys(addPicked)
      .filter((k) => addPicked[k])
      .map((k) => Number(k))
      .filter(Boolean);

    if (memberIds.length === 0) return;

    try {
      setAdding(true);
      const res = await axios.post(
        `${GROUP_API}/${selectedGroup.id}/add-members`,
        { memberIds },
        { headers: authHeaders({ "Content-Type": "application/json" }) }
      );

      setAddOpen(false);
      setAddPicked({});
      setGroupMembers(res.data?.members || []);
      await loadGroups();
    } catch (e) {
      console.error(e);
      alert("Failed to add members.");
    } finally {
      setAdding(false);
    }
  }

  const existingMemberIds = useMemo(() => {
    const set = new Set((groupMembers || []).map((m) => Number(m.id)));
    return set;
  }, [groupMembers]);

  const addCandidates = useMemo(() => {
    return (students || []).filter((s) => !existingMemberIds.has(Number(s.id)));
  }, [students, existingMemberIds]);

  return (
    <div className="flex gap-6 h-[620px]">
      <div className="w-1/3 bg-white rounded-2xl shadow-lg p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Groups</h2>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="px-3 py-1.5 rounded-full bg-yellow-400 text-sm font-semibold"
          >
            + New
          </button>
        </div>

        {loadingGroups && <div className="text-xs text-gray-400 mb-2">Loading…</div>}

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {groups.map((g) => {
            const active = selectedGroup?.id === g.id;
            return (
              <div
                key={g.id}
                className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                  active ? "bg-yellow-100 border-yellow-300" : "hover:bg-gray-50 border-gray-200"
                }`}
              >
                <button type="button" onClick={() => openGroup(g.id)} className="flex-1 text-left">
                  <div className="font-semibold text-gray-800">{g.name}</div>
                  <div className="text-xs text-gray-500">Members: {g.members_count || 0}</div>
                </button>

                <button
                  type="button"
                  onClick={() => deleteGroup(g.id)}
                  className="px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold"
                >
                  Delete
                </button>
              </div>
            );
          })}

          {!loadingGroups && groups.length === 0 && (
            <div className="text-sm text-gray-400 text-center mt-6">No groups yet.</div>
          )}
        </div>
      </div>

      <div className="flex-1">
        {selectedGroup ? (
          <div className="h-full bg-white rounded-2xl shadow-lg p-4 flex flex-col">
            <div className="border-b pb-3 mb-3 flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-gray-800">{selectedGroup.name}</div>
                <div className="text-xs text-gray-500">Members: {groupMembers.length}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setManageOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-gray-200 text-xs font-semibold"
                >
                  Members
                </button>

                {isOwnerSupervisor && (
                  <button
                    type="button"
                    onClick={openAddMembersModal}
                    className="px-3 py-1.5 rounded-full bg-yellow-400 text-xs font-semibold"
                  >
                    + Add Members
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {loadingMsgs && <div className="text-sm text-gray-400">Loading messages…</div>}

              {messages.map((m) => {
                const isMe = Number(m.sender_id) === Number(effectiveSupervisorId);
                const senderName = m.sender_name || "User";

                return (
                  <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm max-w-[420px] shadow ${
                        isMe ? "bg-pink-200" : "bg-gray-100"
                      }`}
                    >
                      {!isMe && (
                        <div className="text-[11px] font-semibold text-gray-700 mb-1">
                          {senderName}
                        </div>
                      )}

                      {renderMessage(m)}

                      <div className="mt-2 text-[11px] text-gray-600 flex items-center justify-between gap-3">
                        <span>{m.created_at ? new Date(m.created_at).toLocaleString() : ""}</span>

                        {isMe && (
                          <button
                            type="button"
                            onClick={() => deleteGroupMessage(m.id)}
                            className="text-[10px] text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {messages.length === 0 && !loadingMsgs && (
                <div className="text-sm text-gray-500 text-center mt-8">
                  No messages yet. Start the group 👋
                </div>
              )}

              <div />
            </div>

            <div ref={endRef} />

            <form onSubmit={sendMessage} className="mt-4 pt-3 border-t flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <input
                  className="flex-1 border rounded-full px-4 py-3 text-sm"
                  placeholder="Type a message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />

                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="text-xs"
                />

                <button
                  type="button"
                  onClick={rec ? stopRecord : startRecord}
                  className="px-3 py-2 rounded-full bg-gray-200 text-xs"
                >
                  {rec ? "Stop" : "Record"}
                </button>

                <button
                  type="submit"
                  disabled={!text.trim() && !file}
                  className="px-6 py-3 rounded-full bg-pink-500 text-white text-sm"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-white rounded-2xl shadow-lg">
            <p className="text-gray-500">Select a group on the left.</p>
          </div>
        )}
      </div>

      {createOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-[560px] bg-white rounded-2xl shadow-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-gray-800">Create Group</div>
              <button type="button" onClick={() => setCreateOpen(false)} className="text-sm text-gray-500">
                Close
              </button>
            </div>

            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm mb-3"
              placeholder="Group name..."
            />

            <div className="text-sm font-semibold text-gray-700 mb-2">Add students</div>

            {loadingStudents ? (
              <div className="text-xs text-gray-400">Loading students…</div>
            ) : (
              <div className="max-h-[280px] overflow-y-auto border rounded-xl p-3 space-y-2">
                {students.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!picked[s.id]}
                      onChange={(e) => setPicked((p) => ({ ...p, [s.id]: e.target.checked }))}
                    />
                    <span className="font-medium">{s.full_name}</span>
                    <span className="text-xs text-gray-500">({s.email})</span>
                  </label>
                ))}
                {students.length === 0 && <div className="text-sm text-gray-400 text-center">No students.</div>}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-full bg-gray-200 text-sm">
                Cancel
              </button>
              <button type="button" onClick={createGroup} className="px-4 py-2 rounded-full bg-yellow-400 text-sm font-semibold">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {addOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-[560px] bg-white rounded-2xl shadow-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-gray-800">Add Members</div>
              <button type="button" onClick={() => setAddOpen(false)} className="text-sm text-gray-500">
                Close
              </button>
            </div>

            <div className="text-sm font-semibold text-gray-700 mb-2">Choose students</div>

            {loadingStudents ? (
              <div className="text-xs text-gray-400">Loading students…</div>
            ) : (
              <div className="max-h-[280px] overflow-y-auto border rounded-xl p-3 space-y-2">
                {addCandidates.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!addPicked[s.id]}
                      onChange={(e) => setAddPicked((p) => ({ ...p, [s.id]: e.target.checked }))}
                    />
                    <span className="font-medium">{s.full_name}</span>
                    <span className="text-xs text-gray-500">({s.email})</span>
                  </label>
                ))}
                {addCandidates.length === 0 && (
                  <div className="text-sm text-gray-400 text-center">No available students to add.</div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-full bg-gray-200 text-sm">
                Cancel
              </button>
              <button
                type="button"
                disabled={adding}
                onClick={addMembers}
                className="px-4 py-2 rounded-full bg-yellow-400 text-sm font-semibold"
              >
                {adding ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {manageOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-[520px] bg-white rounded-2xl shadow-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-gray-800">Members</div>
              <button type="button" onClick={() => setManageOpen(false)} className="text-sm text-gray-500">
                Close
              </button>
            </div>

            <div className="max-h-[340px] overflow-y-auto border rounded-xl p-3 space-y-2">
              {groupMembers.map((m) => {
                const isSupervisor = Number(m.id) === Number(selectedGroup.supervisor_id);
                return (
                  <div key={m.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        {m.name} {isSupervisor ? <span className="text-xs text-pink-600">(Supervisor)</span> : null}
                      </span>
                      <span className="text-xs text-gray-500">{m.role}</span>
                    </div>

                    {isOwnerSupervisor && !isSupervisor && (
                      <button
                        type="button"
                        disabled={removingId === m.id}
                        onClick={() => removeMember(m.id)}
                        className="px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold"
                      >
                        {removingId === m.id ? "Removing..." : "Remove"}
                      </button>
                    )}
                  </div>
                );
              })}

              {groupMembers.length === 0 && <div className="text-sm text-gray-400 text-center">No members.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
