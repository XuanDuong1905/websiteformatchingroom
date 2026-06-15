export type StoredUser = {
  id?: number | string;
  userId?: number | string;
  [key: string]: unknown;
};

export type AuthStoragePayload = {
  token?: unknown;
  user?: unknown;
  data?: unknown;
};

function getBrowserStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function toUserId(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") return null;

  const userId = Number(value);
  return Number.isFinite(userId) && userId > 0 ? userId : null;
}

function findToken(payload: AuthStoragePayload) {
  if (typeof payload.token === "string") return payload.token;

  if (payload.data && typeof payload.data === "object") {
    const data = payload.data as Record<string, unknown>;
    if (typeof data.token === "string") return data.token;
  }

  return null;
}

function findUser(payload: AuthStoragePayload) {
  if (payload.user && typeof payload.user === "object") {
    return payload.user as StoredUser;
  }

  if (payload.data && typeof payload.data === "object") {
    const data = payload.data as Record<string, unknown>;
    if (data.user && typeof data.user === "object") return data.user as StoredUser;
  }

  return null;
}

export function saveAuthResult(result: unknown) {
  const storage = getBrowserStorage();
  if (!storage || !result || typeof result !== "object") return;

  const payload = result as AuthStoragePayload;
  const token = findToken(payload);
  const user = findUser(payload);

  if (token) storage.setItem("token", token);

  if (user) {
    storage.setItem("user", JSON.stringify(user));

    const userId = toUserId(user.id ?? user.userId);
    if (userId) storage.setItem("userId", String(userId));
  }

  window.dispatchEvent(new Event("auth-change"));
}

export function getStoredToken() {
  return getBrowserStorage()?.getItem("token") || null;
}

export function getStoredUserId() {
  const storage = getBrowserStorage();
  if (!storage) return null;

  const storedUser = storage.getItem("user");
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser) as StoredUser;
      const userId = toUserId(user.id ?? user.userId);
      if (userId) return userId;
    } catch {
      // TODO(Member 1): Confirm final auth storage shape after login/register API is stable.
    }
  }

  return toUserId(storage.getItem("userId"));
}
