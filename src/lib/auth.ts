import { toApiUrl } from "@/lib/api-url";

type SessionUser = {
  email: string;
};

type Session = {
  access_token: string;
  user: SessionUser;
};

type AuthChangeEvent = "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED";

const TOKEN_KEY = "blog_admin_token";
const listeners = new Set<(event: AuthChangeEvent, session: Session | null) => void>();

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function parseTokenSession(token: string): Session | null {
  try {
    const [payload] = token.split(".");
    if (!payload) return null;
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
    const json = JSON.parse(atob(padded));
    if (!json?.email || !json?.exp) return null;
    if (Date.now() > Number(json.exp)) return null;
    return {
      access_token: token,
      user: { email: String(json.email) },
    };
  } catch {
    return null;
  }
}

function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function fetchSession(): Promise<Session | null> {
  const token = getToken();
  if (!token) return null;
  const localSession = parseTokenSession(token);
  if (!localSession) {
    setToken(null);
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);
  let res: Response;
  try {
    res = await fetch(toApiUrl("/api/auth/session"), {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
  } catch {
    clearTimeout(timeout);
    return localSession;
  }
  clearTimeout(timeout);

  if (!res.ok) {
    setToken(null);
    return null;
  }

  const data = await res.json();
  return {
    access_token: token,
    user: { email: data.user.email as string },
  };
}

function emit(event: AuthChangeEvent, session: Session | null) {
  listeners.forEach((listener) => listener(event, session));
}

export const auth = {
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      const res = await fetch(toApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { error: { message: data.error || "Login failed" } };
      }

      const token = data.token as string;
      setToken(token);
      const session: Session = { access_token: token, user: { email } };
      emit("SIGNED_IN", session);
      return { error: null };
    } catch {
      return { error: { message: "Network error" } };
    }
  },

  async signOut() {
    const token = getToken();
    if (token) {
      await fetch(toApiUrl("/api/auth/logout"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setToken(null);
    emit("SIGNED_OUT", null);
  },

  async getSession() {
    const token = getToken();
    const fallback = token ? parseTokenSession(token) : null;
    const session = await fetchSession().catch(() => fallback);
    return { data: { session } };
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    listeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe() {
            listeners.delete(callback);
          },
        },
      },
    };
  },

  getAccessToken() {
    return getToken();
  },
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", async (event) => {
    if (event.key !== TOKEN_KEY) return;
    const session = await fetchSession().catch(() => null);
    emit(session ? "TOKEN_REFRESHED" : "SIGNED_OUT", session);
  });
}
