import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import api from './lib/api'
import UploadZone from './components/UploadZone'
import DataPreview from './components/DataPreview'
import VisualizationPanel from './components/VisualizationPanel'
import InsightPanel from './components/InsightPanel'
import DashboardPanel from './components/DashboardPanel'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const { theme, setTheme } = useTheme()
  const [profile, setProfile] = useState(null)
  const [chartData, setChartData] = useState([])
  const [charts, setCharts] = useState([])
  const [insight, setInsight] = useState(null)
  const [dashboardName, setDashboardName] = useState('Executive Overview')
  const columns = useMemo(() => profile?.inferred_types?.map((c) => c.name) || [], [profile])

  const [config, setConfig] = useState({ graph_type: 'bar', x_axis: '', y_axis: '', sort_order: 'asc' })
  const [targetColumn, setTargetColumn] = useState('')
  const [categoryColumn, setCategoryColumn] = useState('')
  const [nlq, setNlq] = useState('')

  const uploadFile = async (file) => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post('/upload', form)
    setProfile(data)
    const cols = data.inferred_types.map((c) => c.name)
    setConfig((prev) => ({ ...prev, x_axis: cols[0] || '', y_axis: cols[1] || cols[0] || '' }))
    setTargetColumn(cols[1] || cols[0] || '')
    setCategoryColumn(cols[0] || '')
  }

  const generateChart = async () => {
    const { data } = await api.post('/visualize', config)
    setChartData(data.data)
    setCharts((prev) => [...prev, { title: `${config.graph_type} chart`, ...config }])
  }

  const cleanData = async (remove_nulls, drop_duplicates) => {
    const form = new FormData()
    form.append('remove_nulls', remove_nulls)
    form.append('drop_duplicates', drop_duplicates)
    const { data } = await api.post('/clean', form)
    setProfile(data)
  }

  const runInsights = async () => {
    const { data } = await api.post('/insights', { target_column: targetColumn, category_column: categoryColumn || null })
    setInsight(data)
  }

  const saveDashboard = async () => {
    await api.post('/dashboard/save', {
      name: dashboardName,
      charts,
      insights_summary: insight?.ai_summary?.text || 'No insights yet'
    })
    alert('Dashboard saved')
  }

  const exportPdf = async () => {
    const response = await api.get('/dashboard/export-pdf', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `${dashboardName}.pdf`
    a.click()
  }

  const exportPng = () => {
    const svg = document.querySelector('svg')
    if (!svg) return alert('No chart to export yet')
    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svg)
    const image = new Image()
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.width || 1200
      canvas.height = image.height || 600
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0)
      URL.revokeObjectURL(url)
      const png = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${dashboardName}.png`
      link.href = png
      link.click()
    }
    image.src = url
  }

  const runNlq = async () => {
    const { data } = await api.post('/nlq', { query: nlq })
    setConfig((prev) => ({ ...prev, ...data.chart_config }))
  }

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">DataDrishti AI</h1>
          <p className="text-slate-300">AI-powered spreadsheet analytics platform</p>
        </div>
        <button className="glass px-4 py-2" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun /> : <Moon />}
        </button>
      </header>

      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <UploadZone onFile={uploadFile} />
      </motion.section>

      <div className="glass p-4 flex flex-wrap gap-2 items-center">
        <button className="bg-sky-500 text-black px-3 py-2 rounded font-semibold" onClick={() => cleanData(true, false)}>Remove Null Values</button>
        <button className="bg-violet-500 text-black px-3 py-2 rounded font-semibold" onClick={() => cleanData(false, true)}>Remove Duplicates</button>
        <input className="bg-slate-900 rounded p-2 flex-1 min-w-64" placeholder='NL Query: "Show sales growth month-wise"' value={nlq} onChange={(e) => setNlq(e.target.value)} />
        <button className="bg-lime-400 text-black px-3 py-2 rounded font-semibold" onClick={runNlq}>Generate from Query</button>
      </div>

      <DataPreview profile={profile} />
      {columns.length > 0 && (
        <VisualizationPanel
          columns={columns}
          chartData={chartData}
          config={config}
          setConfig={setConfig}
          onGenerate={generateChart}
        />
      )}
      {columns.length > 0 && (
        <InsightPanel
          insight={insight}
          onAnalyze={runInsights}
          targetColumn={targetColumn}
          setTargetColumn={setTargetColumn}
          categoryColumn={categoryColumn}
          setCategoryColumn={setCategoryColumn}
          columns={columns}
        />
      )}
      <DashboardPanel
        charts={charts}
        dashboardName={dashboardName}
        setDashboardName={setDashboardName}
        onSave={saveDashboard}
        onExportPdf={exportPdf}
        onExportPng={exportPng}
      />
    </main>
  )
}
