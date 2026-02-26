export default function DataPreview({ profile }) {
  if (!profile) return null
  const columns = profile.preview?.length ? Object.keys(profile.preview[0]) : []

  return (
    <div className="glass p-4 overflow-x-auto space-y-3">
      <h3 className="font-semibold">Data Preview</h3>
      <div className="text-sm grid md:grid-cols-3 gap-2">
        <p>Rows: <b>{profile.row_count}</b></p>
        <p>Columns: <b>{profile.column_count}</b></p>
        <p>Duplicates: <b>{profile.duplicate_rows}</b></p>
      </div>

      <div className="text-xs grid md:grid-cols-2 gap-4">
        <div>
          <p className="font-medium mb-1">Missing values</p>
          <ul className="space-y-1">
            {Object.entries(profile.missing_values || {}).map(([k, v]) => (
              <li key={k}>{k}: <span className="text-amber-300">{v}</span></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium mb-1">Detected data types</p>
          <ul className="space-y-1">
            {(profile.inferred_types || []).map((c) => (
              <li key={c.name}>{c.name}: <span className="text-cyan-300">{c.dtype}</span></li>
            ))}
          </ul>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} className="text-left p-2 border-b border-white/10">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(profile.preview || []).map((row, idx) => (
            <tr key={idx}>
              {columns.map((col) => (
                <td key={col} className="p-2 border-b border-white/5">{String(row[col] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
