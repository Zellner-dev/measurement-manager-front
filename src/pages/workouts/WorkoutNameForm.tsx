import { useState, type FormEvent } from 'react'
import { Button } from '../../components/Button'
import { ErrorMessage } from '../../components/Feedback'
import { Input } from '../../components/Input'
import { errorMessage } from '../../services/api'

interface NameFormProps {
  label: string
  placeholder?: string
  initialValue?: string
  submitLabel: string
  onSubmit: (name: string) => Promise<void>
}

/** Single "name" field form, shared by workouts and exercises (both DTOs only carry a name, max 100). */
export function NameForm({ label, placeholder, initialValue = '', submitLabel, onSubmit }: NameFormProps) {
  const [name, setName] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(name.trim())
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorMessage message={error} />}
      <Input
        label={label}
        placeholder={placeholder}
        maxLength={100}
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button type="submit" block loading={submitting} disabled={!name.trim()}>
        {submitLabel}
      </Button>
    </form>
  )
}
