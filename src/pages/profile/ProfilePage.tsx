import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { ErrorMessage } from '../../components/Feedback'
import { LogoutIcon } from '../../components/Icons'
import { Input } from '../../components/Input'
import { ConfirmDialog } from '../../components/Modal'
import { PageHeader, SectionTitle } from '../../components/PageHeader'
import { useAuth, useCurrentUser } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { ApiError, encodeBasic, errorMessage } from '../../services/api'
import { userService } from '../../services/userService'

function ProfileForm() {
  const user = useCurrentUser()
  const { refresh } = useAuth()
  const toast = useToast()
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const emailChanged = email.trim() !== user.email
  const dirty = name.trim() !== user.name || emailChanged

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (emailChanged) {
        // HTTP Basic credentials include the email: confirm the password to rebuild them after the change
        await userService.me(encodeBasic(user.email, password))
      }
      const updated = await userService.update(user.id, { name: name.trim(), email: email.trim() })
      refresh(updated, emailChanged ? password : undefined)
      setPassword('')
      toast.success('Perfil atualizado.')
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? 'Senha atual incorreta.' : errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorMessage message={error} />}
      <Input label="Nome" autoComplete="name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        maxLength={255}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {emailChanged && (
        <Input
          label="Senha atual"
          type="password"
          autoComplete="current-password"
          hint="Necessária para alterar o e-mail de acesso."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      )}
      <Button type="submit" block loading={saving} disabled={!dirty || !name.trim() || (emailChanged && !password)}>
        Salvar alterações
      </Button>
    </form>
  )
}

function PasswordForm() {
  const user = useCurrentUser()
  const { refresh } = useAuth()
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8 || password.length > 72) return setError('A senha deve ter entre 8 e 72 caracteres.')
    if (password !== confirm) return setError('As senhas não conferem.')
    setSaving(true)
    try {
      await userService.changePassword(user.id, password)
      refresh(user, password)
      setPassword('')
      setConfirm('')
      toast.success('Senha alterada.')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorMessage message={error} />}
      <Input
        label="Nova senha"
        type="password"
        autoComplete="new-password"
        maxLength={72}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        label="Confirmar nova senha"
        type="password"
        autoComplete="new-password"
        maxLength={72}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      <Button type="submit" variant="secondary" block loading={saving} disabled={!password || !confirm}>
        Alterar senha
      </Button>
    </form>
  )
}

export function ProfilePage() {
  const user = useCurrentUser()
  const { logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const deleteAccount = async () => {
    try {
      await userService.remove(user.id)
      logout()
      toast.success('Conta excluída.')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader title="Perfil" />
      <div className="mb-8 flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-brand font-display text-3xl font-extrabold uppercase text-black">
          {user.name.trim()[0]}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-2xl font-bold uppercase">{user.name}</p>
          <p className="truncate text-sm text-muted">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <SectionTitle>Dados pessoais</SectionTitle>
          <ProfileForm key={`${user.name}|${user.email}`} />
        </section>
        <section>
          <SectionTitle>Senha</SectionTitle>
          <PasswordForm />
        </section>
      </div>

      <div className="mt-10 space-y-3 border-t border-line pt-6">
        <Button variant="secondary" block icon={<LogoutIcon className="size-5" />} onClick={logout}>
          Sair
        </Button>
        <Button variant="ghost" block className="text-danger hover:text-danger" onClick={() => setConfirmDelete(true)}>
          Excluir conta
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir conta?"
        message="Sua conta será removida permanentemente. Esta ação não pode ser desfeita."
        confirmLabel="Excluir conta"
        onConfirm={deleteAccount}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  )
}
