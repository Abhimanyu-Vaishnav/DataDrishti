import { UploadCloud } from 'lucide-react'

export default function UploadZone({ onFile }) {
  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="glass p-8 border-dashed border-2 border-cyan-400/40 text-center"
    >
      <UploadCloud className="mx-auto mb-3" />
      <p className="text-lg font-medium">Drag & drop CSV/XLSX here</p>
      <input
        type="file"
        accept=".csv,.xlsx"
        className="mt-4"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
    </div>
  )
}
