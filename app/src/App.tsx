import { useMemo, useState } from 'react'
import { generateChart, getShichenOptions, type Gender } from '@/lib/astro'

interface FormState {
  date: string
  hour: number
  gender: Gender
}

const SHICHEN_OPTIONS = getShichenOptions()

function getDefaultDate() {
  const d = new Date('1995-01-01T00:00:00')
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function App() {
  const [form, setForm] = useState<FormState>({
    date: getDefaultDate(),
    hour: 23,
    gender: 'male',
  })
  const [error, setError] = useState<string>('')
  const [chart, setChart] = useState<ReturnType<typeof generateChart> | null>(null)

  const parsedDate = useMemo(() => {
    const [year, month, day] = form.date.split('-').map(Number)
    return { year, month, day }
  }, [form.date])

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!form.date) {
      setError('请选择出生日期。')
      return
    }

    try {
      const nextChart = generateChart({
        year: parsedDate.year,
        month: parsedDate.month,
        day: parsedDate.day,
        hour: form.hour,
        gender: form.gender,
      })
      setChart(nextChart)
    } catch (e) {
      console.error(e)
      setError('排盘失败，请检查输入后再试。')
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Ziwei Chart Generator</h1>
        <p className="subtitle">输入出生日期后，一键生成紫微斗数命盘。</p>

        <form onSubmit={onSubmit} className="form">
          <label>
            出生日期
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              required
            />
          </label>

          <label>
            出生时辰
            <select
              value={form.hour}
              onChange={(e) => setForm((prev) => ({ ...prev, hour: Number(e.target.value) }))}
            >
              {SHICHEN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            性别
            <select
              value={form.gender}
              onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value as Gender }))}
            >
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </label>

          <button type="submit">生成命盘</button>
        </form>

        {error ? <p className="error">{error}</p> : null}
      </div>

      {chart ? (
        <section className="result card">
          <h2>命盘结果</h2>
          <div className="meta-grid">
            <p><strong>阳历：</strong>{form.date}</p>
            <p><strong>农历：</strong>{chart.lunarDate}</p>
            <p><strong>干支：</strong>{chart.chineseDate}</p>
            <p><strong>五行局：</strong>{chart.fiveElementsClass}</p>
            <p><strong>命主：</strong>{chart.soul}</p>
            <p><strong>身主：</strong>{chart.body}</p>
          </div>

          <div className="palace-grid">
            {(chart.palaces || []).map((palace) => (
              <article key={`${palace.name}-${palace.earthlyBranch}`} className="palace">
                <h3>{palace.name}（{palace.heavenlyStem}{palace.earthlyBranch}）</h3>
                <p>
                  <strong>主星：</strong>
                  {(palace.majorStars || []).map((s) => s.name).join('、') || '无'}
                </p>
                <p>
                  <strong>辅星：</strong>
                  {(palace.minorStars || []).map((s) => s.name).join('、') || '无'}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
