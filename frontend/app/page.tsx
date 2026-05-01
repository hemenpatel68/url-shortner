"use client";

import { EmptyState } from "@/components/EmptyState";
import ThemeToggle from "@/components/ToggleButton";
import { ShortUrl } from "@/types/type";
import { apiRequest, apiBase } from "@/utils/apiRequest";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const getShortUrlBase = () => {
  const envBase = process.env.NEXT_PUBLIC_SHORT_URL_BASE;

  // Ensure we have a valid absolute URL
  if (
    envBase &&
    (envBase.startsWith("http://") || envBase.startsWith("https://"))
  ) {
    return envBase;
  }

  // Fallback: use the API base without the trailing /api if available
  if (
    apiBase &&
    (apiBase.startsWith("http://") || apiBase.startsWith("https://"))
  ) {
    return apiBase.replace(/\/api\/?$/, "");
  }

  // Last resort: use current origin (frontend domain)
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
};

const shortUrlBase = getShortUrlBase();
console.log("Short URL Base:", shortUrlBase);

export const Home = () => {
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
  const router = useRouter();

  const isAuthenticated = Boolean(token);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

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
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
              URL Shortner
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950 dark:text-white sm:text-4xl">
              Build, manage, and share short links.
            </h1>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <ThemeToggle />
            {isAuthenticated ? (
              <button
                className="h-11 w-full rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800 sm:w-auto"
                onClick={logout}
                type="button"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <form className="space-y-4" onSubmit={handleCreate}>
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Shorten a link
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Paste a full URL and optionally choose your own short code.
              </p>
            </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Destination URL
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-950"
                  onChange={(event) => setTargetUrl(event.target.value)}
                  placeholder="https://example.com/article"
                  required
                  type="url"
                  value={targetUrl}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Custom code
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-950"
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

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">Your links</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {isAuthenticated
                  ? `${shortUrls.length} saved short link${
                      shortUrls.length === 1 ? "" : "s"
                    }`
                  : "Log in to view and manage your links."}
              </p>
            </div>

            {isAuthenticated ? (
              <button
                className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800"
                onClick={() => void loadShortUrls()}
                type="button"
              >
                Refresh
              </button>
            ) : null}
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {sortedUrls.length === 0 ? (
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
                          className="break-all text-base font-bold text-cyan-700 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-200"
                          href={shortLink}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {shortLink}
                        </a>
                        <p className="mt-2 break-all text-sm leading-6 text-slate-500 dark:text-slate-400">
                          {url.targetURL}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800"
                          onClick={() => void copyLink(url.shortCode)}
                          type="button"
                        >
                          {copiedCode === url.shortCode ? "Copied" : "Copy"}
                        </button>
                        <button
                          className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800"
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
                          className="h-10 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-red-900/70 dark:text-red-300 dark:hover:bg-red-950/40"
                          disabled={isLoading}
                          onClick={() => void handleDelete(url.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="mt-4 grid gap-3 rounded-md bg-slate-50 p-4 dark:bg-slate-800/70 md:grid-cols-[1fr_180px_auto]">
                        <input
                          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-cyan-400 dark:focus:ring-cyan-950"
                          onChange={(event) => setEditUrl(event.target.value)}
                          type="url"
                          value={editUrl}
                        />
                        <input
                          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-cyan-400 dark:focus:ring-cyan-950"
                          maxLength={155}
                          onChange={(event) => setEditCode(event.target.value)}
                          value={editCode}
                        />
                        <button
                          className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
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
