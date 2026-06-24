const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(method, path, body = null, includeCredentials = true) {
  const options = {
    method,
    headers: {},
    credentials: includeCredentials ? 'include' : 'same-origin',
  };

  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = response.headers.get('content-type')?.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error(data?.error || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const signup = (credentials) => request('POST', '/api/auth/signup', credentials);
export const login = (credentials) => request('POST', '/api/auth/login', credentials);
export const fetchMe = () => request('GET', '/api/auth/me');
export const logout = () => request('POST', '/api/auth/logout');
