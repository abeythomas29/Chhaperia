import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { api } from "../api/client";

type Log = {
  id: string;
  date: string;
  rollsCount: number;
  unit: string;
  quantityPerRoll: number;
  totalQuantity: number;
  productCode: { code: string };
  worker: { name: string; employeeId: string };
  issuedToCompany: { name: string };
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [from, setFrom] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
  const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));

  async function load() {
    const { data } = await api.get("/admin/logs", { params: { from, to } });
    setLogs(data);
  }

  async function exportCsv() {
    const response = await api.get("/admin/logs/export", {
      params: { from, to },
      responseType: "blob",
    });
    const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `production-log-${dayjs().format("YYYYMMDD-HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="filters card row">
        <label>From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label>To <input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        <button onClick={load}>Apply</button>
        <button onClick={exportCsv}>Export CSV</button>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Code</th><th>Worker</th><th>Rolls</th><th>Unit</th><th>Qty/Roll</th><th>Total</th><th>Issued To</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{dayjs(l.date).format("YYYY-MM-DD")}</td>
                <td>{l.productCode.code}</td>
                <td>{l.worker.name} ({l.worker.employeeId})</td>
                <td>{l.rollsCount}</td>
                <td>{l.unit}</td>
                <td>{l.quantityPerRoll}</td>
                <td>{l.totalQuantity}</td>
                <td>{l.issuedToCompany.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
