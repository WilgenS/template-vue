const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export interface ApiOptions extends RequestInit {
  params?: Record<string, string>
}

export class ApiError extends Error {
  status: number
  data: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options

  let url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`
  
  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  try {
    const response = await fetch(url, {
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      ...restOptions,
    })

    if (!response.ok) {
      let errorData = null
      try {
        errorData = await response.json()
      } catch {
        // Ignorar si la respuesta no es JSON
      }
      throw new ApiError(
        errorData?.message || `HTTP error! Status: ${response.status}`,
        response.status,
        errorData
      )
    }

    return (await response.json()) as T
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err
    }
    throw new ApiError(err.message || 'Error de red al conectar con el servidor', 0)
  }
}
