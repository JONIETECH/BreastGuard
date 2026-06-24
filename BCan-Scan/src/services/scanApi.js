const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(method, path) {
  const options = {
    method,
    headers: {},
    credentials: 'include',
  };

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

export const getScans = () => request('GET', '/api/scans');
export const getScan = (id) => request('GET', `/api/scans/${id}`);
export const deleteScan = (id) => request('DELETE', `/api/scans/${id}`);
