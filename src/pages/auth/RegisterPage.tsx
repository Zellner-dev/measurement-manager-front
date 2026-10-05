import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { ErrorMessage } from '../../components/Feedback'
import { Input } from '../../components/Input'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { ApiError, errorMessage } from '../../services/api'
import { userService } from '../../services/userService'
import { AuthShell } from './AuthShell'

type Field = 'name' | 'email' | 'password' | 'confirm'

// Mirrors UserCreateRequest validation
function validate(values: Record<Field, string>): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {}
  if (!values.name.trim()) errors.name = 'Informe seu nome.'
  else if (values.name.length > 100) errors.name = 'Máximo de 100 caracteres.'
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = 'Informe um e-mail válido.'
  if (values.password.length < 8) errors.password = 'A senha precisa ter ao menos 8 caracteres.'
  else if (values.password.length > 72) errors.password = 'Máximo de 72 caracteres.'
  if (values.confirm !== values.password) errors.confirm = 'As senhas não conferem.'
  return errors
}

export function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [values, setValues] = useState<Record<Field, string>>({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [field]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setSubmitting(true)
    const email = values.email.trim()
    try {
      await userService.register({ name: values.name.trim(), email, password: values.password })
      await login(email, values.password)
      toast.success('Conta criada. Bem-vindo!')
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) {
        setErrors(err.fieldErrors as Partial<Record<Field, string>>)
      }
      setError(errorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Criar conta" subtitle="Comece a registrar sua evolução hoje.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <ErrorMessage message={error} />}
        <Input label="Nome" autoComplete="name" maxLength={100} value={values.name} onChange={set('name')} error={errors.name} />
        <Input
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={255}
          value={values.email}
          onChange={set('email')}
          error={errors.email}
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="new-password"
          maxLength={72}
          hint="Mínimo de 8 caracteres."
          value={values.password}
          onChange={set('password')}
          error={errors.password}
        />
        <Input
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          maxLength={72}
          value={values.confirm}
          onChange={set('confirm')}
          error={errors.confirm}
        />
        <Button type="submit" block size="xl" loading={submitting}>
          Criar conta
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Entrar
        </Link>
      </p>
    </AuthShell>
  )
}
