export function getAdminAuthErrorMessage(error, options = {}) {
  const isDev = Boolean(options.isDev)
  const status = error?.response?.status
  const message = error?.response?.data?.error?.message

  if (message) {
    return message
  }

  if (status === 404) {
    return isDev
      ? 'API endpoint not found. Check that the local backend is running and the Vite /api proxy is configured correctly.'
      : 'API endpoint not found. Check that the deployed API is running and the Vercel proxy is routing /api correctly.'
  }

  if (status === 401) {
    return 'Invalid email or password.'
  }

  if (error?.code === 'ECONNABORTED') {
    return isDev
      ? 'The backend request timed out. Check the local backend on localhost:3000 and the Vite /api proxy.'
      : 'The backend request timed out. Check the deployed API service and the /api proxy route.'
  }

  if (error?.message === 'Network Error') {
    return isDev
      ? 'Could not reach the local backend. Verify the local server is running on localhost:3000 and the Vite /api proxy is active.'
      : 'Could not reach the deployed API. Verify the backend is running and the Vercel /api proxy is configured correctly.'
  }

  return 'Login failed'
}
