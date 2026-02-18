import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";

type Company = {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState("");

  async function load() {
    const { data } = await api.get("/admin/companies");
    setCompanies(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function addCompany(e: FormEvent) {
    e.preventDefault();
    await api.post("/admin/companies", { name });
    setName("");
    load();
  }

  async function toggleStatus(id: string, status: Company["status"]) {
    await api.patch(`/admin/companies/${id}/status`, { status: status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
    load();
  }

  return (
    <div>
      <form className="card row" onSubmit={addCompany}>
        <h3>Add Company / Client</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Company name" required />
        <button type="submit">Add Company</button>
      </form>

      <div className="card">
        <h3>Issued-To Companies</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.status}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => toggleStatus(c.id, c.status)}>
                      {c.status === "ACTIVE" ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
