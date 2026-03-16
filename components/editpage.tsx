"use client";
import { useEffect, useRef, useState } from "react";
import PortfolioItemEditor from "@/components/portfolioitemeditor";
import { PortfolioItem } from "@/components/types/portfolio";

const API_BASE = "https://blue-river-ebb7.tomaszkkmaher.workers.dev"

async function loginRequest(password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? "Login failed");
  }

  const { token } = await res.json();
  return token as string;
}

/** Attach to any protected fetch call */
export function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = localStorage.getItem("token");

  if (token && isTokenExpired(token)) {
    localStorage.removeItem("token");
    window.location.href = "/edit"; // or wherever your login page is
    return Promise.reject(new Error("Session expired"));
  }

  return fetch(input, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    return Math.floor(Date.now() / 1000) > payload.exp;
  } catch {
    return true; // malformed token — treat as expired
  }
}

// ─── Login screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pw || loading) return;

    setError("");
    setLoading(true);

    try {
      const token = await loginRequest(pw);
      localStorage.setItem("token", token);
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
      setPw("");
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div >
        <div>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1>Restricted Area</h1>
        <p>Enter your access key to continue</p>

        <form onSubmit={handleSubmit} >
          <div>
            <input
              ref={inputRef}
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <p>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !pw}
          >
            {loading ? (
              <span/>
            ) : (
              "Unlock"
            )}
          </button>
        </form>
      </div>

    </div>
  );
}

export default function EditPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  async function getPortfolioItems() {
    await fetch(`${API_BASE}/api/portfolio`, {})
      .then((res) => res.json())
      .then((data) => {
        let output: PortfolioItem[] = [];
        for (const item of data.items) {
          output.push({
            id: item.id,
            name: item.name,
            body: item.body,
            client: item.client,
            video_url: item.video_url ? item.video_url : null,
            tags: item.tags.split(','),
            images: item.images,
            date: new Date(item.date),
            link: item.link ? item.link : null,
          });
        }
        setPortfolioItems(output);
      
      })
      .catch((err) => {
          console.error("Error fetching portfolio items:", err);
      });
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    if (token && isTokenExpired(token)) {
      localStorage.removeItem("token");
      setLoggedIn(false);
    } else {
      setLoggedIn(!!token);
    }
  
    setChecking(false);
    getPortfolioItems();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setLoggedIn(false);
  }

  if (checking) return null;

  if (!loggedIn) {
    return <LoginScreen onSuccess={() => setLoggedIn(true)} />;
  }

  const dummyData: PortfolioItem = {
    id: "",
    name: "New Project",
    body: "",
    client: "",
    tags: [],
    images: [],
    date: new Date(),
    
  }

  const deleteItem = async (id: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const response = await fetch(`${API_BASE}/api/portfolio/${id}`, {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error((err as any).error ?? `HTTP ${response.status}`);
      }

      alert(`${name} deleted successfully!`);
      window.location.reload();
    } catch (err: any) {
        console.error(err);
        alert(`Error: ${err.message}`);
    }
  }

  return (
    <div>
      <div>
        <h1>Edit Portfolio</h1>
        <button
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
      <br/>
      {/* Your protected content here */}
      {portfolioItems.map(item => (
        <div key={item.id} className="border-1 border-solid">  
          <PortfolioItemEditor item={item} />
          <button onClick={(e) => deleteItem(item.id)}>Delete</button>
          <br/>
          
        </div>
      ))}
      <br/>
      <PortfolioItemEditor item={dummyData}/>
    </div>
  );
}
