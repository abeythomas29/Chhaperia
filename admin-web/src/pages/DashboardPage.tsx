import { useEffect, useState } from "react";
import { api } from "../api/client";

type DashboardData = {
  rolls: { today: number; weekly: number; monthly: number };
  productionByCode: { code: string; totalQuantity: number }[];
  issuedByCompany: { company: string; totalQuantity: number }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi"><h3>Today Rolls</h3><p>{data.rolls.today}</p></div>
        <div className="kpi"><h3>Weekly Rolls</h3><p>{data.rolls.weekly}</p></div>
        <div className="kpi"><h3>Monthly Rolls</h3><p>{data.rolls.monthly}</p></div>
      </div>
      <section className="card">
        <h3>Production By Product Code</h3>
        <ul>{data.productionByCode.map((x) => <li key={x.code}>{x.code}: {x.totalQuantity.toFixed(2)}</li>)}</ul>
      </section>
      <section className="card">
        <h3>Issued Quantity By Company</h3>
        <ul>{data.issuedByCompany.map((x) => <li key={x.company}>{x.company}: {x.totalQuantity.toFixed(2)}</li>)}</ul>
      </section>
    </div>
  );
}
