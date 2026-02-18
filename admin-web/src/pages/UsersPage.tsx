import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";

type User = { id: string; name: string; employeeId: string; role: string; status: string };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ name: "", employeeId: "", username: "", password: "", role: "WORKER" });

  async function load() {
    const { data } = await api.get("/admin/users");
    setUsers(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    await api.post("/admin/users", form);
    setForm({ name: "", employeeId: "", username: "", password: "", role: "WORKER" });
    load();
  }

  async function toggleStatus(id: string, status: string) {
    await api.patch(`/admin/users/${id}/status`, { status: status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
    load();
  }

  return (
    <div>
      <form className="card row" onSubmit={create}>
        <h3>Create User</h3>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <input placeholder="Employee ID" value={form.employeeId} onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))} required />
        <input placeholder="Username (admins)" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
        <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
          <option value="WORKER">WORKER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
        </select>
        <button type="submit">Create</button>
      </form>

      <div className="card table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Employee ID</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.employeeId}</td>
                <td>{u.role}</td>
                <td>{u.status}</td>
                <td><button onClick={() => toggleStatus(u.id, u.status)}>Toggle</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
