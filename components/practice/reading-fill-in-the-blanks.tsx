import { useState } from 'react'

interface ReadingFillInTheBlanksProps {
  text: string
  blanks: { id: string; correctAnswer: string; options: string[] }[]
  onComplete?: (answers: Record<string, string>) => void
}

export function ReadingFillInTheBlanks({
  text,
  blanks,
  onComplete,
}: ReadingFillInTheBlanksProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(
    blanks.reduce((acc, blank) => ({ ...acc, [blank.id]: '' }), {})
  )

  const handleSelect = (blankId: string, option: string) => {
    const newAnswers = { ...answers, [blankId]: option }
    setAnswers(newAnswers)
  }

  // Split text to insert dropdowns at blank positions
  const textParts = text.split('___BLANK___')

  return (
    <div className="space-y-6">
      <div className="bg-muted rounded-lg p-4">
        {textParts.map((part, index) => (
          <span key={index}>
            {part}
            {index < blanks.length && (
              <select
                value={answers[blanks[index].id] || ''}
                onChange={(e) => handleSelect(blanks[index].id, e.target.value)}
                className="mx-1 rounded border p-1 text-sm"
              >
                <option value="">Select option</option>
                {blanks[index].options.map((option, optIndex) => (
                  <option key={optIndex} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {blanks.map((blank) => (
          <div key={blank.id} className="text-sm">
            <div className="font-medium">Blank {blank.id} Options:</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {blank.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(blank.id, option)}
                  className={`rounded border px-2 py-1 text-xs ${
                    answers[blank.id] === option
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
