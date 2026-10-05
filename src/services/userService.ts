import type { User, UserCreateRequest, UserUpdateRequest } from '../types/api'
import { request } from './api'

export const userService = {
  register: (data: UserCreateRequest) => request<User>('/users', { method: 'POST', body: data, auth: '' }),
  me: (auth?: string) => request<User>('/users/me', { auth }),
  update: (id: number, data: UserUpdateRequest) => request<User>(`/users/${id}`, { method: 'PUT', body: data }),
  changePassword: (id: number, password: string) =>
    request<void>(`/users/${id}/password`, { method: 'PATCH', body: { password } }),
  remove: (id: number) => request<void>(`/users/${id}`, { method: 'DELETE' }),
}
