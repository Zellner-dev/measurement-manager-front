// Mirrors the Spring Boot DTOs (com.zellner.workoutmanager.dto)

/** LocalDateTime serialized by Jackson, without timezone: "2026-10-04T12:30:00" */
export type LocalDateTime = string

export interface User {
  id: number
  name: string
  email: string
}

export interface UserCreateRequest {
  name: string
  email: string
  password: string
}

export interface UserUpdateRequest {
  name: string
  email: string
}

export interface Workout {
  id: number
  name: string
  ownerId: number
}

export interface Exercise {
  id: number
  name: string
  workoutId: number
}

export interface WorkoutLog {
  id: number
  performedAt: LocalDateTime
  workoutId: number
}

export interface ExerciseLog {
  id: number
  weight: number | null
  workoutLogId: number
  exerciseId: number
}

export interface Measurement {
  id: number
  name: string
  measuredValue: number
  measuredAt: LocalDateTime
  ownerId: number
}

export interface MeasurementRequest {
  name: string
  measuredValue: number
  measuredAt?: LocalDateTime
}

/** RFC 7807 ProblemDetail returned by GlobalExceptionHandler */
export interface ProblemDetail {
  status?: number
  title?: string
  detail?: string
  errors?: Record<string, string>
}
