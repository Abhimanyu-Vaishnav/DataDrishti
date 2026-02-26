export default function DashboardPanel({ charts, dashboardName, setDashboardName, onSave, onExportPdf, onExportPng }) {
  return (
    <div className="glass p-4 space-y-3">
      <h3 className="font-semibold">Dashboard Mode</h3>
      <input className="bg-slate-900 rounded p-2 w-full" value={dashboardName} onChange={(e) => setDashboardName(e.target.value)} placeholder="Dashboard name" />
      <div className="text-sm">Charts in board: {charts.length}</div>
      <div className="flex flex-wrap gap-2">
        <button className="bg-emerald-400 text-black rounded px-3 py-2 font-semibold" onClick={onSave}>Save Dashboard</button>
        <button className="bg-amber-300 text-black rounded px-3 py-2 font-semibold" onClick={onExportPng}>Download Charts as PNG</button>
        <button className="bg-rose-300 text-black rounded px-3 py-2 font-semibold" onClick={onExportPdf}>Export Insights PDF</button>
      </div>
    </div>
  )
}
