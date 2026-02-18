import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

type Category = { id: string; name: string; status: string; codes: { id: string; code: string; status: string }[] };

export default function ProductsPage() {
  const { user } = useAuth();
  const canManage = user?.role === "SUPER_ADMIN";
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [newCode, setNewCode] = useState({ categoryId: "", code: "", description: "" });

  async function load() {
    const { data } = await api.get("/admin/products");
    setCategories(data);
    if (!newCode.categoryId && data[0]) setNewCode((p) => ({ ...p, categoryId: data[0].id }));
  }

  useEffect(() => {
    load();
  }, []);

  async function addCategory(e: FormEvent) {
    e.preventDefault();
    await api.post("/admin/products/category", { name: categoryName });
    setCategoryName("");
    load();
  }

  async function addCode(e: FormEvent) {
    e.preventDefault();
    await api.post("/admin/products/code", newCode);
    setNewCode((p) => ({ ...p, code: "", description: "" }));
    load();
  }

  async function toggleCodeStatus(codeId: string, status: string) {
    await api.patch(`/admin/products/code/${codeId}/status`, { status: status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
    load();
  }

  return (
    <div>
      {canManage && (
        <>
          <form className="card row" onSubmit={addCategory}>
            <h3>Add Category</h3>
            <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Category name" required />
            <button type="submit">Add Category</button>
          </form>

          <form className="card row" onSubmit={addCode}>
            <h3>Add Product Code</h3>
            <select value={newCode.categoryId} onChange={(e) => setNewCode((p) => ({ ...p, categoryId: e.target.value }))}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={newCode.code} onChange={(e) => setNewCode((p) => ({ ...p, code: e.target.value }))} placeholder="Code" required />
            <input value={newCode.description} onChange={(e) => setNewCode((p) => ({ ...p, description: e.target.value }))} placeholder="Description (optional)" />
            <button type="submit">Add Code</button>
          </form>
        </>
      )}

      <div className="card">
        <h3>Current Products</h3>
        {categories.map((c) => (
          <div key={c.id} className="category-box">
            <h4>{c.name} ({c.status})</h4>
            <ul>
              {c.codes.map((code) => (
                <li key={code.id}>
                  {code.code} - {code.status}
                  {canManage && <button onClick={() => toggleCodeStatus(code.id, code.status)}>Toggle</button>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
