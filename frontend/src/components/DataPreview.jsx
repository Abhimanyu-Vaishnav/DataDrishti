export default function DataPreview({ profile }) {
  if (!profile) return null
  const columns = profile.preview?.length ? Object.keys(profile.preview[0]) : []

  return (
    <div className="glass p-4 overflow-x-auto">
      <h3 className="font-semibold mb-2">Data Preview</h3>
      <div className="text-sm mb-2">
        Rows: {profile.row_count} | Columns: {profile.column_count} | Duplicate Rows: {profile.duplicate_rows}
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
          {profile.preview.map((row, idx) => (
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
