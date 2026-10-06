import type { ProblemDetail } from '../types/api'

declare global {
  interface Window {
    /** Runtime config written by the container at startup (public/env.js) */
    __ENV__?: { VITE_API_URL?: string }
  }
}

const BASE_URL = (window.__ENV__?.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '') + '/api'
const CREDENTIALS_KEY = 'wm.credentials'

export const UNAUTHORIZED_EVENT = 'wm:unauthorized'

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

/** Base64 "email:password" for the HTTP Basic header (the backend's auth mechanism). */
export function encodeBasic(email: string, password: string): string {
  const bytes = new TextEncoder().encode(`${email}:${password}`)
  return btoa(String.fromCharCode(...bytes))
}

/** Credentials live in localStorage: the login survives reloads, closing the tab and browser restarts until logout. */
export const credentials = {
  get(): string | null {
    try {
      return localStorage.getItem(CREDENTIALS_KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(CREDENTIALS_KEY, token)
    } catch {
      /* storage unavailable: session lasts until reload */
    }
  },
  clear() {
    try {
      localStorage.removeItem(CREDENTIALS_KEY)
    } catch {
      /* storage unavailable */
    }
  },
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Nome',
  email: 'E-mail',
  password: 'Senha',
  measuredValue: 'Valor',
  measuredAt: 'Data',
  performedAt: 'Data',
  weight: 'Carga',
}

function messageFor(status: number, problem: ProblemDetail | null): string {
  if (status === 401) return 'E-mail ou senha inválidos.'
  if (status === 403) return 'Você não tem permissão para esta ação.'
  if (status === 404) return 'Registro não encontrado.'
  if (status === 409) return 'Este e-mail já está em uso.'
  if (status === 400 && problem?.errors) {
    return Object.entries(problem.errors)
      .map(([field, msg]) => `${FIELD_LABELS[field] ?? field}: ${msg}`)
      .join('\n')
  }
  if (status === 400 && problem?.detail) return problem.detail
  if (status >= 500) return 'O servidor encontrou um erro. Tente novamente em instantes.'
  return problem?.detail ?? 'Algo deu errado. Tente novamente.'
}

interface RequestOptions {
  method?: string
  body?: unknown
  /** Explicit Basic token (login); empty string sends no Authorization header (register). */
  auth?: string
}

export async function request<T>(path: string, { method = 'GET', body, auth }: RequestOptions = {}): Promise<T> {
  const token = auth ?? credentials.get()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Basic ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique sua conexão.')
  }

  if (!response.ok) {
    let problem: ProblemDetail | null = null
    try {
      problem = (await response.json()) as ProblemDetail
    } catch {
      /* empty or non-JSON body */
    }
    if (response.status === 401 && auth === undefined) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    throw new ApiError(response.status, messageFor(response.status, problem), problem?.errors)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Algo deu errado. Tente novamente.'
}
