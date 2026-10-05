import type { Measurement, MeasurementRequest } from '../types/api'
import { request } from './api'

export const measurementService = {
  listByUser: (userId: number) => request<Measurement[]>(`/users/${userId}/measurements`),
  create: (userId: number, data: MeasurementRequest) =>
    request<Measurement>(`/users/${userId}/measurements`, { method: 'POST', body: data }),
  remove: (id: number) => request<void>(`/measurements/${id}`, { method: 'DELETE' }),
}
