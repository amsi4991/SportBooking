
export async function apiFetch(url: string, options: any = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:3000' + url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : ''
    }
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/';
  }

  return res.json();
}
