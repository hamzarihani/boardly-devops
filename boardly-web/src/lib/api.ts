export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem('access_token')
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  }

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  // Handle Unauthorized error (token expired)
  if (response.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
    const refreshToken = localStorage.getItem('refresh_token')
    
    if (refreshToken) {
      try {
        // Attempt to refresh the token
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })

        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          
          // Store new tokens
          localStorage.setItem('access_token', data.accessToken)
          localStorage.setItem('refresh_token', data.refreshToken)

          // Retry the original request with new token
          const retryHeaders = {
            ...headers,
            'Authorization': `Bearer ${data.accessToken}`,
          }

          response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: retryHeaders,
          })
          
          return response.json()
        }
      } catch (error) {
        console.error('Token refresh failed:', error)
      }
    }
    
    // If we reach here, refresh failed or was not possible
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    // You might want to redirect to login here or throw a specific error
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'API request failed')
  }

  return response.json()
}
