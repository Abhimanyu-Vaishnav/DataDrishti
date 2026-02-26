import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const COLORS = ['#22d3ee', '#60a5fa', '#818cf8', '#34d399', '#f472b6', '#facc15']
const GRAPH_TYPES = ['bar', 'line', 'pie', 'area', 'scatter', 'histogram', 'heatmap', 'correlation']

function CorrelationTable({ matrixPayload }) {
  const columns = matrixPayload?.columns || []
  const matrix = matrixPayload?.matrix || []
  if (!columns.length) return <p className="text-sm text-slate-400">Need at least 2 numeric columns for correlation.</p>

  return (
    <div className="overflow-auto">
      <table className="w-full text-xs border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="p-2 bg-slate-800 rounded">Column</th>
            {columns.map((c) => <th key={c} className="p-2 bg-slate-800 rounded">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={columns[i]}>
              <td className="p-2 bg-slate-800 rounded">{columns[i]}</td>
              {row.map((value, j) => {
                const intensity = Math.min(1, Math.abs(value))
                const bg = value >= 0 ? `rgba(34,197,94,${intensity})` : `rgba(239,68,68,${intensity})`
                return <td key={`${i}-${j}`} className="p-2 rounded text-center" style={{ background: bg }}>{value}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function VisualizationPanel({
  columns,
  chartResponse,
  config,
  setConfig,
  onGenerate,
  filterDraft,
  setFilterDraft,
  addFilter,
  clearFilters,
}) {
  const records = chartResponse?.result?.data || []

  const renderedChart = useMemo(() => {
    if (!chartResponse) return null
    const mode = chartResponse.result?.mode
    const xKey = chartResponse.result?.x_axis || config.x_axis
    const yKey = chartResponse.result?.y_axis || config.y_axis

    if (mode === 'matrix') return <CorrelationTable matrixPayload={chartResponse.result.data} />

    if (mode === 'heatmap') {
      return (
        <BarChart width={780} height={320} data={records}>
          <CartesianGrid strokeDasharray="3 3" stroke="#64748b" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#22d3ee" />
        </BarChart>
      )
    }

    const common = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="#64748b" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
      </>
    )

    switch (config.graph_type) {
      case 'line':
        return <LineChart width={780} height={320} data={records}>{common}<Line type="monotone" dataKey={yKey} stroke="#22d3ee" /></LineChart>
      case 'pie':
        return (
          <PieChart width={780} height={320}>
            <Pie data={records} dataKey={yKey} nameKey={xKey} outerRadius={120} label>
              {records.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        )
      case 'area':
        return <AreaChart width={780} height={320} data={records}>{common}<Area type="monotone" dataKey={yKey} fill="#0ea5e9" stroke="#38bdf8" /></AreaChart>
      case 'scatter':
        return <ScatterChart width={780} height={320}>{common}<Scatter data={records} fill="#34d399" /></ScatterChart>
      case 'histogram':
        return <BarChart width={780} height={320} data={records}>{common}<Bar dataKey={yKey} fill="#facc15" /></BarChart>
      case 'bar':
      default:
        return <BarChart width={780} height={320} data={records}>{common}<Bar dataKey={yKey} fill="#60a5fa" /></BarChart>
    }
  }, [chartResponse, records, config])

  return (
    <div className="glass p-4 space-y-4">
      <h3 className="font-semibold">Visualization Engine</h3>

      <div className="grid md:grid-cols-6 gap-3">
        <select className="bg-slate-900 rounded p-2" value={config.graph_type} onChange={(e) => setConfig({ ...config, graph_type: e.target.value })}>
          {GRAPH_TYPES.map((type) => <option key={type}>{type}</option>)}
        </select>

        <select className="bg-slate-900 rounded p-2" value={config.x_axis} onChange={(e) => setConfig({ ...config, x_axis: e.target.value })}>
          {columns.map((c) => <option key={c}>{c}</option>)}
        </select>

        <select className="bg-slate-900 rounded p-2" value={config.y_axis || ''} onChange={(e) => setConfig({ ...config, y_axis: e.target.value })}>
          <option value="">No Y Axis</option>
          {columns.map((c) => <option key={c}>{c}</option>)}
        </select>

        <select className="bg-slate-900 rounded p-2" value={config.group_by || ''} onChange={(e) => setConfig({ ...config, group_by: e.target.value || null })}>
          <option value="">No Group By</option>
          {columns.map((c) => <option key={c}>{c}</option>)}
        </select>

        <select className="bg-slate-900 rounded p-2" value={config.sort_by || ''} onChange={(e) => setConfig({ ...config, sort_by: e.target.value || null })}>
          <option value="">Sort by X</option>
          {columns.map((c) => <option key={c}>{c}</option>)}
        </select>

        <select className="bg-slate-900 rounded p-2" value={config.sort_order} onChange={(e) => setConfig({ ...config, sort_order: e.target.value })}>
          <option value="asc">asc</option>
          <option value="desc">desc</option>
        </select>
      </div>

      <div className="grid md:grid-cols-5 gap-3">
        <select className="bg-slate-900 rounded p-2" value={filterDraft.column} onChange={(e) => setFilterDraft({ ...filterDraft, column: e.target.value })}>
          {columns.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="bg-slate-900 rounded p-2" value={filterDraft.operator} onChange={(e) => setFilterDraft({ ...filterDraft, operator: e.target.value })}>
          {['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains'].map((op) => <option key={op}>{op}</option>)}
        </select>
        <input className="bg-slate-900 rounded p-2" value={filterDraft.value} onChange={(e) => setFilterDraft({ ...filterDraft, value: e.target.value })} placeholder="Filter value" />
        <button className="bg-fuchsia-400 text-black font-semibold rounded p-2" onClick={addFilter}>Add Filter</button>
        <button className="bg-slate-500 text-white font-semibold rounded p-2" onClick={clearFilters}>Clear Filters</button>
      </div>

      <button className="bg-cyan-500 text-black font-semibold rounded p-2" onClick={onGenerate}>Generate Chart</button>
      {chartResponse && <p className="text-xs text-slate-300">Rows after filters: {chartResponse.row_count_after_filters}</p>}
      <div className="overflow-auto">{renderedChart}</div>
    </div>
  )
}
