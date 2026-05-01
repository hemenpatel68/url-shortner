export async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  //  401 HANDLING
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return null;
  }

  return res.json();
}
