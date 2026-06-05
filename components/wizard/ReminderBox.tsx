import type { DocumentReminder } from '@/data/reminders'

interface ReminderBoxProps {
  reminder: DocumentReminder
}

const styles = {
  warning: {
    icon: '⚠️',
    background: '#FFFBEB',
    border: '#FCD34D',
  },
  info: {
    icon: 'ℹ️',
    background: '#EFF6FF',
    border: '#BFDBFE',
  },
} satisfies Record<DocumentReminder['type'], { icon: string; background: string; border: string }>

export function ReminderBox({ reminder }: ReminderBoxProps) {
  const style = styles[reminder.type]

  return (
    <div
      className="mb-4 rounded-xl px-4 py-3"
      style={{ backgroundColor: style.background, border: `1px solid ${style.border}` }}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="mt-0.5 shrink-0 text-sm">
          {style.icon}
        </span>
        <div>
          <h3 className="font-semibold text-gray-900" style={{ fontSize: 13 }}>
            {reminder.title}
          </h3>
          <p className="mt-1 text-gray-700" style={{ fontSize: 13, lineHeight: 1.6 }}>
            {reminder.message}
          </p>
          {reminder.learnMoreUrl && (
            <a
              href={reminder.learnMoreUrl}
              className="mt-2 inline-block font-semibold text-gray-800 underline underline-offset-2"
              style={{ fontSize: 13 }}
            >
              Saznaj više →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
