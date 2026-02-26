export default function InsightPanel({ insight, onAnalyze, targetColumn, setTargetColumn, categoryColumn, setCategoryColumn, columns }) {
  return (
    <div className="glass p-4 space-y-3">
      <h3 className="font-semibold">AI Insights</h3>
      <div className="grid md:grid-cols-3 gap-3">
        <select className="bg-slate-900 rounded p-2" value={targetColumn} onChange={(e) => setTargetColumn(e.target.value)}>
          {columns.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="bg-slate-900 rounded p-2" value={categoryColumn} onChange={(e) => setCategoryColumn(e.target.value)}>
          <option value="">No Category</option>
          {columns.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="bg-indigo-400 text-black rounded p-2 font-semibold" onClick={onAnalyze}>Generate Insights</button>
      </div>
      {insight && (
        <div className="text-sm space-y-1">
          <p><b>Trend:</b> {insight.trend}</p>
          <p><b>Anomaly points:</b> {(insight.anomalies || []).length}</p>
          <p><b>Prediction (next point):</b> {Number(insight.prediction || 0).toFixed(2)}</p>
          <p><b>Top Category:</b> {insight.top_category ? `${insight.top_category.category} (${Number(insight.top_category.value).toFixed(2)})` : 'N/A'}</p>
          <p><b>Summary:</b> {insight.ai_summary?.text}</p>
        </div>
      )}
    </div>
  )
}
