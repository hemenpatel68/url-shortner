"use client";

import { EmptyState } from "@/components/EmptyState";
import { AuthMode, ShortUrl } from "@/types/type";
import { apiRequest, apiBase } from "@/utils/apiRequest";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const shortUrlBase =
  process.env.NEXT_PUBLIC_SHORT_URL_BASE ?? "http://localhost:8000";

export const Home = () => {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.localStorage.getItem("url-shortner-token") ?? "";
  });
  const [targetUrl, setTargetUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortUrls, setShortUrls] = useState<ShortUrl[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editCode, setEditCode] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");

  const isAuthenticated = Boolean(token);

  const sortedUrls = useMemo(() => {
    return [...shortUrls].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [shortUrls]);

  const loadShortUrls = useCallback(
    async (authToken = token) => {
      if (!authToken) {
        return;
      }

      try {
        const data = await apiRequest<{ shortUrls: ShortUrl[] }>(
          "/allShortUrls",
          {},
          authToken,
        );
        setShortUrls(data.shortUrls);
      } catch (requestError) {
        toast.error((requestError as Error).message);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadShortUrls(token);
  }, [loadShortUrls, token]);

  const handleAuth = async (event: any) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (authMode === "signup") {
        await apiRequest("/users/signup", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        setAuthMode("login");
        toast.success("Account created. Log in to start shortening links.");
        setPassword("");
        return;
      }

      const data = await apiRequest<{ access_token: string; message: string }>(
        "/users/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
      );

      window.localStorage.setItem("url-shortner-token", data.access_token);
      setToken(data.access_token);
      setPassword("");
      toast.success("You are logged in.");
    } catch (requestError) {
      toast.error((requestError as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (event: any) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const body: { url: string; code?: string } = { url: targetUrl };

      if (customCode.trim()) {
        body.code = customCode.trim();
      }

      await apiRequest(
        "/shorten",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
        token,
      );
      setTargetUrl("");
      setCustomCode("");
      toast.success("Short link created.");

      await loadShortUrls();
    } catch (requestError) {
      toast.error((requestError as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setIsLoading(true);

    try {
      const body: { url?: string; code?: string } = {};

      if (editUrl.trim()) {
        body.url = editUrl.trim();
      }

      if (editCode.trim()) {
        body.code = editCode.trim();
      }

      await apiRequest(
        `/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
        },
        token,
      );
      setEditingId(null);
      setEditUrl("");
      setEditCode("");
      toast.success("Short link updated.");
      await loadShortUrls();
    } catch (requestError) {
      toast.error((requestError as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);

    try {
      await apiRequest(
        `/${id}`,
        {
          method: "DELETE",
        },
        token,
      );
      setShortUrls((currentUrls) => currentUrls.filter((url) => url.id !== id));
      toast.success("Short link deleted.");
    } catch (requestError) {
      toast.error((requestError as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = async (shortCode: string) => {
    const shortLink = `${shortUrlBase}/${shortCode}`;
    await navigator.clipboard.writeText(shortLink);
    setCopiedCode(shortCode);
    window.setTimeout(() => setCopiedCode(""), 1400);
  };

  const logout = () => {
    window.localStorage.removeItem("url-shortner-token");
    setToken("");
    setShortUrls([]);
    toast.success("Logged out.");
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              URL Shortner
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              Build, manage, and share short links.
            </h1>
          </div>

          {isAuthenticated ? (
            <button
              className="h-11 w-full rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 sm:w-auto"
              onClick={logout}
              type="button"
            >
              Logout
            </button>
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {!isAuthenticated ? (
            <>
              <div className="mb-5 flex rounded-md bg-slate-100 p-1">
                {(["login", "signup"] as const).map((mode) => (
                  <button
                    className={`h-10 flex-1 rounded-md text-sm font-semibold transition ${
                      authMode === mode
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                    key={mode}
                    onClick={() => {
                      setAuthMode(mode);
                    }}
                    type="button"
                  >
                    {mode === "login" ? "Login" : "Sign up"}
                  </button>
                ))}
              </div>

              <form className="space-y-4" onSubmit={handleAuth}>
                {authMode === "signup" ? (
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Name
                    </span>
                    <input
                      className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                      minLength={3}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Hemen Patel"
                      required
                      value={name}
                    />
                  </label>
                ) : null}

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Email
                  </span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Password
                  </span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                    minLength={3}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 3 characters"
                    required
                    type="password"
                    value={password}
                  />
                </label>

                <button
                  className="h-11 w-full rounded-md bg-cyan-700 px-4 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading
                    ? "Please wait"
                    : authMode === "login"
                      ? "Login"
                      : "Create account"}
                </button>
              </form>
            </>
          ) : (
            <form className="space-y-4" onSubmit={handleCreate}>
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Shorten a link
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Paste a full URL and optionally choose your own short code.
                </p>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Destination URL
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                  onChange={(event) => setTargetUrl(event.target.value)}
                  placeholder="https://example.com/article"
                  required
                  type="url"
                  value={targetUrl}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Custom code
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                  maxLength={155}
                  onChange={(event) => setCustomCode(event.target.value)}
                  placeholder="launch"
                  value={customCode}
                />
              </label>

              <button
                className="h-11 w-full rounded-md bg-cyan-700 px-4 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? "Creating" : "Create short link"}
              </button>
            </form>
          )}
        </aside>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Your links</h2>
              <p className="mt-1 text-sm text-slate-500">
                {isAuthenticated
                  ? `${shortUrls.length} saved short link${
                      shortUrls.length === 1 ? "" : "s"
                    }`
                  : "Log in to view and manage your links."}
              </p>
            </div>

            {isAuthenticated ? (
              <button
                className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                onClick={() => void loadShortUrls()}
                type="button"
              >
                Refresh
              </button>
            ) : null}
          </div>

          <div className="divide-y divide-slate-200">
            {!isAuthenticated ? (
              <EmptyState title="No session yet" />
            ) : sortedUrls.length === 0 ? (
              <EmptyState title="No short links yet" />
            ) : (
              sortedUrls.map((url) => {
                const shortLink = `${shortUrlBase}/${url.shortCode}`;
                const isEditing = editingId === url.id;

                return (
                  <article className="p-5" key={url.id}>
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <a
                          className="break-all text-base font-bold text-cyan-700 hover:text-cyan-900"
                          href={shortLink}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {shortLink}
                        </a>
                        <p className="mt-2 break-all text-sm leading-6 text-slate-500">
                          {url.targetURL}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                          onClick={() => void copyLink(url.shortCode)}
                          type="button"
                        >
                          {copiedCode === url.shortCode ? "Copied" : "Copy"}
                        </button>
                        <button
                          className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                          onClick={() => {
                            setEditingId(isEditing ? null : url.id);
                            setEditUrl(url.targetURL);
                            setEditCode(url.shortCode);
                          }}
                          type="button"
                        >
                          {isEditing ? "Cancel" : "Edit"}
                        </button>
                        <button
                          className="h-10 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
                          disabled={isLoading}
                          onClick={() => void handleDelete(url.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="mt-4 grid gap-3 rounded-md bg-slate-50 p-4 md:grid-cols-[1fr_180px_auto]">
                        <input
                          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                          onChange={(event) => setEditUrl(event.target.value)}
                          type="url"
                          value={editUrl}
                        />
                        <input
                          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                          maxLength={155}
                          onChange={(event) => setEditCode(event.target.value)}
                          value={editCode}
                        />
                        <button
                          className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                          disabled={isLoading}
                          onClick={() => void handleUpdate(url.id)}
                          type="button"
                        >
                          Save
                        </button>
                      </div>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </section>
    </main>
  );
};

export default Home;
