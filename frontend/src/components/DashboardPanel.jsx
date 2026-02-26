export default function DashboardPanel({ charts, dashboardName, setDashboardName, onSave, onExportPdf, onExportPng, removeChart }) {
  return (
    <div className="glass p-4 space-y-3">
      <h3 className="font-semibold">Dashboard Mode</h3>
      <input className="bg-slate-900 rounded p-2 w-full" value={dashboardName} onChange={(e) => setDashboardName(e.target.value)} placeholder="Dashboard name" />

      <div className="space-y-2">
        {charts.map((chart, idx) => (
          <div key={`${chart.title}-${idx}`} className="bg-slate-900/60 rounded p-2 flex justify-between items-center text-sm">
            <span>{idx + 1}. {chart.title} ({chart.graph_type})</span>
            <button className="text-red-300" onClick={() => removeChart(idx)}>Remove</button>
          </div>
        ))}
        {charts.length === 0 && <p className="text-sm text-slate-400">No charts added yet.</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="bg-emerald-400 text-black rounded px-3 py-2 font-semibold" onClick={onSave}>Save Dashboard</button>
        <button className="bg-amber-300 text-black rounded px-3 py-2 font-semibold" onClick={onExportPng}>Download Charts as PNG</button>
        <button className="bg-rose-300 text-black rounded px-3 py-2 font-semibold" onClick={onExportPdf}>Export Insights PDF</button>
      </div>
    </div>
  )
}
