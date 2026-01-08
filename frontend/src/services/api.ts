
export async function apiFetch(url: string, options: any = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:3000' + url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : ''
    }
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/';
  }

  const data = await res.json();
  
  if (!res.ok) {
    const errorMsg = data.message || data.error || JSON.stringify(data);
    throw new Error(errorMsg);
  }

  return data;
}
