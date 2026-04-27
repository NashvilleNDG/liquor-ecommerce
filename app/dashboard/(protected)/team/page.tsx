"use client";

import { useState, useEffect } from "react";
import { UserCog, Plus, Trash2, X, Loader2, Shield, Eye, Edit3 } from "lucide-react";

interface Member { id: string; name: string; email: string; role: "manager" | "editor" | "viewer"; active: boolean; createdAt: string; lastLogin: string | null; }

const ROLES: { value: Member["role"]; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { value: "manager", label: "Manager",  desc: "Full access except account deletion", icon: Shield, color: "text-amber-700 bg-amber-100" },
  { value: "editor",  label: "Editor",   desc: "Can edit products, orders, promotions", icon: Edit3, color: "text-stone-700 bg-stone-100" },
  { value: "viewer",  label: "Viewer",   desc: "Read-only access to all pages",       icon: Eye,    color: "text-stone-500 bg-stone-100" },
];

const inp = "w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-400 transition-colors placeholder-stone-400";
const EMPTY = { name: "", email: "", role: "viewer" as Member["role"], password: "" };

export default function TeamPage() {
  const [members,  setMembers]  = useState<Member[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  async function load() { setLoading(true); const r = await fetch("/api/team"); setMembers(await r.json()); setLoading(false); }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSaving(true);
    const res = await fetch("/api/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed"); setSaving(false); return; }
    setMembers(prev => [...prev, data]); setForm(EMPTY); setShowForm(false); setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Remove this team member?")) return;
    await fetch("/api/team", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch("/api/team", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, active }) });
    setMembers(prev => prev.map(m => m.id === id ? { ...m, active } : m));
  }

  return (
    <div className="min-h-full bg-white">
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 rounded-xl p-2.5"><UserCog size={18} className="text-amber-600" /></div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Team Members</h1>
              <p className="text-sm text-stone-400 mt-0.5">{members.filter(m=>m.active).length} active staff members</p>
            </div>
          </div>
          <button onClick={() => { setShowForm(true); setError(""); }} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-sm rounded-xl transition-colors">
            <Plus size={15} /> Add Member
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-screen-xl mx-auto space-y-6">

        {/* Role legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {ROLES.map(r => (
            <div key={r.value} className="bg-white border border-stone-200 rounded-xl p-4 flex items-start gap-3">
              <div className={`rounded-lg p-1.5 ${r.color}`}><r.icon size={14} /></div>
              <div>
                <p className="font-bold text-stone-900 text-sm">{r.label}</p>
                <p className="text-xs text-stone-400 mt-0.5">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-white border border-amber-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-stone-900">Add Team Member</h2>
              <button onClick={() => setShowForm(false)}><X size={16} className="text-stone-400" /></button>
            </div>
            <form onSubmit={create} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input className={inp} required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Jane Smith" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Email *</label>
                <input className={inp} type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@stonesriver.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Role</label>
                <select className={inp} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as Member["role"] }))}>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Temporary Password *</label>
                <input className={inp} type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 8 characters" />
              </div>
              {error && <p className="sm:col-span-2 text-red-600 text-sm">{error}</p>}
              <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-sm rounded-xl disabled:opacity-60">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Member
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Members table */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-amber-400" /></div>
        ) : members.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center">
            <UserCog size={32} className="text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-semibold">No team members yet</p>
            <p className="text-stone-400 text-sm mt-1">Add staff to give them dashboard access.</p>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>{["Member", "Email", "Role", "Status", "Joined", ""].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {members.map(m => {
                  const role = ROLES.find(r => r.value === m.role)!;
                  return (
                    <tr key={m.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-amber-700 text-xs font-bold">{m.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="font-semibold text-stone-900">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-500 text-xs">{m.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${role.color}`}>{role.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(m.id, !m.active)}
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors ${m.active ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}>
                          {m.active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-400">{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => remove(m.id)} className="text-stone-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
