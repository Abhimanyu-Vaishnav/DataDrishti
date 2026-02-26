import { useMemo, useState } from 'react'
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

export default function VisualizationPanel({ columns, chartData, config, setConfig, onGenerate }) {
  const availableTypes = ['bar', 'line', 'pie', 'area', 'scatter', 'histogram', 'heatmap', 'correlation']

  const renderedChart = useMemo(() => {
    if (!chartData?.length || !config.x_axis) return null
    const y = config.y_axis || columns[1]
    const common = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="#64748b" />
        <XAxis dataKey={config.x_axis} />
        <YAxis />
        <Tooltip />
        <Legend />
      </>
    )
    switch (config.graph_type) {
      case 'line':
        return <LineChart width={640} height={300} data={chartData}>{common}<Line type="monotone" dataKey={y} stroke="#22d3ee" /></LineChart>
      case 'pie':
        return (
          <PieChart width={640} height={300}>
            <Pie data={chartData} dataKey={y} nameKey={config.x_axis} outerRadius={110} label>
              {chartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        )
      case 'area':
        return <AreaChart width={640} height={300} data={chartData}>{common}<Area type="monotone" dataKey={y} fill="#0ea5e9" stroke="#38bdf8" /></AreaChart>
      case 'scatter':
        return <ScatterChart width={640} height={300}>{common}<Scatter data={chartData} fill="#34d399" /></ScatterChart>
      case 'histogram':
        return <BarChart width={640} height={300} data={chartData}>{common}<Bar dataKey={y} fill="#facc15" /></BarChart>
      case 'heatmap':
      case 'correlation':
        return <div className="text-sm text-slate-300">Heatmap/Correlation currently rendered as tabular matrix in this starter. Use backend Plotly for advanced matrix output.</div>
      case 'bar':
      default:
        return <BarChart width={640} height={300} data={chartData}>{common}<Bar dataKey={y} fill="#60a5fa" /></BarChart>
    }
  }, [chartData, config, columns])

  return (
    <div className="glass p-4 space-y-4">
      <h3 className="font-semibold">Visualization Engine</h3>
      <div className="grid md:grid-cols-4 gap-3">
        <select className="bg-slate-900 rounded p-2" value={config.graph_type} onChange={(e) => setConfig({ ...config, graph_type: e.target.value })}>
          {availableTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
        <select className="bg-slate-900 rounded p-2" value={config.x_axis} onChange={(e) => setConfig({ ...config, x_axis: e.target.value })}>
          {columns.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="bg-slate-900 rounded p-2" value={config.y_axis} onChange={(e) => setConfig({ ...config, y_axis: e.target.value })}>
          {columns.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="bg-cyan-500 text-black font-semibold rounded p-2" onClick={onGenerate}>Generate</button>
      </div>
      <div className="overflow-auto">{renderedChart}</div>
    </div>
  )
}
