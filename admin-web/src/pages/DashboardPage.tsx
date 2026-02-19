import { useEffect, useState } from "react";
import { api } from "../api/client";

type DashboardData = {
  rolls: { today: number; weekly: number; monthly: number };
  stats: {
    monthlyEntries: number;
    avgDailyRolls: number;
    avgRollsPerEntry: number;
    majorBuyer: { company: string; totalQuantity: number } | null;
    topMaterial: { code: string; totalQuantity: number } | null;
    weeklyProductionRate: number;
  };
  productionByCode: { code: string; totalQuantity: number }[];
  issuedByCompany: { company: string; totalQuantity: number }[];
  dailyTrend: { date: string; rolls: number; totalQuantity: number }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then((res) => setData(res.data))
      .catch(() => setError("Unable to load dashboard data. Please login again and check backend deployment."));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi"><h3>Today Production (Rolls)</h3><p>{data.rolls.today}</p></div>
        <div className="kpi"><h3>Weekly Production (Rolls)</h3><p>{data.rolls.weekly}</p></div>
        <div className="kpi"><h3>Monthly Production (Rolls)</h3><p>{data.rolls.monthly}</p></div>
        <div className="kpi"><h3>Average Daily Rate</h3><p>{data.stats.avgDailyRolls}</p></div>
        <div className="kpi"><h3>Avg Rolls per Entry</h3><p>{data.stats.avgRollsPerEntry}</p></div>
        <div className="kpi"><h3>Weekly Daily Avg</h3><p>{data.stats.weeklyProductionRate}</p></div>
      </div>

      <div className="insight-grid">
        <section className="card">
          <h3>Major Buyer</h3>
          {data.stats.majorBuyer ? (
            <p className="insight-value">{data.stats.majorBuyer.company} ({data.stats.majorBuyer.totalQuantity.toFixed(2)})</p>
          ) : (
            <p className="muted">No data yet</p>
          )}
        </section>

        <section className="card">
          <h3>Most Produced Material</h3>
          {data.stats.topMaterial ? (
            <p className="insight-value">{data.stats.topMaterial.code} ({data.stats.topMaterial.totalQuantity.toFixed(2)})</p>
          ) : (
            <p className="muted">No data yet</p>
          )}
        </section>

        <section className="card">
          <h3>Entries This Month</h3>
          <p className="insight-value">{data.stats.monthlyEntries}</p>
        </section>
      </div>

      <section className="card">
        <h3>Production By Product Code</h3>
        <ul>{data.productionByCode.slice(0, 10).map((x) => <li key={x.code}>{x.code}: {x.totalQuantity.toFixed(2)}</li>)}</ul>
      </section>

      <section className="card">
        <h3>Issued Quantity By Company</h3>
        <ul>{data.issuedByCompany.slice(0, 10).map((x) => <li key={x.company}>{x.company}: {x.totalQuantity.toFixed(2)}</li>)}</ul>
      </section>

      <section className="card">
        <h3>Last 7 Days Production Trend</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Rolls</th>
                <th>Total Quantity</th>
              </tr>
            </thead>
            <tbody>
              {data.dailyTrend.map((x) => (
                <tr key={x.date}>
                  <td>{x.date}</td>
                  <td>{x.rolls}</td>
                  <td>{x.totalQuantity.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
