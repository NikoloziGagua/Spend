import { useRef, type ChangeEvent, type ReactNode } from 'react'
import { catLabel } from '../categories'
import { todayKey, useStore } from '../lib/store'
import type { Settings } from '../types'
import { Card, Toggle } from '../components/ui'

const TOGGLES: { key: keyof Settings; label: string; desc: string }[] = [
  { key: 'autoRecurring', label: 'Auto-log recurring', desc: 'Add subscriptions on their schedule' },
  { key: 'autocomplete', label: 'Smart autocomplete', desc: "Suggest expenses you've added before" },
  { key: 'sounds', label: 'Sound on entry', desc: 'Subtle beep when you record' },
  { key: 'warnings', label: 'Budget warnings', desc: 'Show insights when nearing limits' },
]

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export function SettingsView() {
  const { data, budgets, recurring, settings, setSettings, importData, clearAll, showToast } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const exportJson = () => {
    download(
      `ledger-backup-${todayKey()}.json`,
      JSON.stringify({ version: 2, store: data, budgets, recurring, settings, exportedAt: new Date().toISOString() }, null, 2),
      'application/json'
    )
    showToast('Backup downloaded')
  }

  const exportCsv = () => {
    let csv = 'date,description,category,amount,note,recurring\n'
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    Object.keys(data)
      .sort()
      .forEach((k) => {
        ;(data[k] || []).forEach((e) => {
          csv += [k, esc(e.desc), catLabel(e.cat), e.amount.toFixed(2), esc(e.note), e.recurringId ? 'yes' : 'no'].join(',') + '\n'
        })
      })
    download(`ledger-${todayKey()}.csv`, csv, 'text/csv')
    showToast('CSV downloaded')
  }

  const onImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        importData(JSON.parse(String(ev.target?.result)))
      } catch {
        showToast('Invalid file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div>
      <Card className="mb-4">
        <div className="mb-3.5 font-serif text-[24px] italic text-ink">Behavior</div>
        {TOGGLES.map((t, i) => (
          <div
            key={t.key}
            className={`flex items-center justify-between border-b border-line py-4 ${i === 0 ? 'pt-0' : ''}`}
          >
            <div>
              <div className="text-[14px] text-ink">{t.label}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[.06em] text-faint">{t.desc}</div>
            </div>
            <Toggle on={settings[t.key]} onChange={(v) => setSettings({ [t.key]: v })} />
          </div>
        ))}
      </Card>

      <Card className="mb-4">
        <div className="mb-3.5 font-serif text-[24px] italic text-ink">Data</div>
        <div className="mb-3 flex flex-wrap gap-2">
          <DataBtn onClick={exportJson}>Export JSON</DataBtn>
          <DataBtn onClick={() => fileRef.current?.click()}>Import JSON</DataBtn>
          <DataBtn onClick={exportCsv}>Export CSV</DataBtn>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Delete all data? This cannot be undone.')) clearAll()
          }}
          className="rounded-full border px-[17px] py-[11px] font-mono text-[10px] uppercase tracking-[.14em] text-danger transition-colors hover:text-white"
          style={{ borderColor: 'color-mix(in srgb, var(--danger) 28%, transparent)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--danger)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          Clear all data
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={onImport} className="hidden" />
      </Card>

      <Card className="mb-4">
        <div className="mb-3.5 font-serif text-[24px] italic text-ink">About</div>
        <p className="font-serif text-[14px] italic leading-[1.6] text-faint">
          A small ledger. Your numbers stay on your device. Nothing sent anywhere.
        </p>
      </Card>
    </div>
  )
}

function DataBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-line px-[17px] py-[11px] font-mono text-[10px] uppercase tracking-[.14em] text-sub transition-colors hover:border-faint hover:text-ink"
    >
      {children}
    </button>
  )
}
