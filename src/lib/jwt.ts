export type JwtRole = "STUDENT" | "LANDLORD" | "ADMIN";
export type JwtStatus = "APPROVED" | "PENDING" | "REJECTED";

export type JwtUserPayload = {
  userId: number;
  email: string;
  role: JwtRole;
  status?: JwtStatus;
  [key: string]: unknown;
};

export type JwtPayload = JwtUserPayload & {
  iat?: number;
  exp?: number;
};

type JwtHeader = {
  alg: "HS256";
  typ: "JWT";
};

type GenerateTokenOptions = {
  expiresIn?: number | string;
  secret?: string;
};

type VerifyTokenOptions = {
  secret?: string;
};

const DEFAULT_EXPIRES_IN = "7d";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSubtleCrypto() {
  const subtle = globalThis.crypto?.subtle;

  if (!subtle) {
    throw new Error("Web Crypto API is not available");
  }

  return subtle;
}

function getJwtSecret(secret?: string) {
  const jwtSecret = secret ?? process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwtSecret;
}

function parseExpiresIn(expiresIn: number | string) {
  if (typeof expiresIn === "number") {
    if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
      throw new Error("JWT expiresIn must be a positive number of seconds");
    }

    return Math.floor(expiresIn);
  }

  const match = expiresIn.match(/^(\d+)([smhd])$/);

  if (!match) {
    throw new Error("JWT expiresIn must use seconds or a value like 15m, 12h, or 7d");
  }

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };

  return value * multipliers[unit];
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function base64UrlEncode(value: string) {
  return bytesToBase64Url(encoder.encode(value));
}

function base64UrlDecode(value: string) {
  return decoder.decode(base64UrlToBytes(value));
}

async function importHmacKey(secret: string, keyUsages: KeyUsage[]) {
  return getSubtleCrypto().importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    keyUsages,
  );
}

async function sign(value: string, secret: string) {
  const key = await importHmacKey(secret, ["sign"]);
  const signature = await getSubtleCrypto().sign("HMAC", key, encoder.encode(value));

  return bytesToBase64Url(new Uint8Array(signature));
}

async function verifySignature(value: string, signature: string, secret: string) {
  const key = await importHmacKey(secret, ["verify"]);

  return getSubtleCrypto().verify(
    "HMAC",
    key,
    base64UrlToBytes(signature),
    encoder.encode(value),
  );
}

function parseJsonPart<T>(value: string, label: string) {
  try {
    return JSON.parse(base64UrlDecode(value)) as T;
  } catch {
    throw new Error(`Invalid JWT ${label}`);
  }
}

export async function generateToken(
  payload: JwtUserPayload,
  options: GenerateTokenOptions = {},
) {
  const secret = getJwtSecret(options.secret);
  const now = Math.floor(Date.now() / 1000);
  const expiresInSeconds = parseExpiresIn(options.expiresIn ?? DEFAULT_EXPIRES_IN);
  const header: JwtHeader = {
    alg: "HS256",
    typ: "JWT",
  };
  const tokenPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = await sign(signatureInput, secret);

  return `${signatureInput}.${signature}`;
}

export async function verifyToken<TPayload extends JwtPayload = JwtPayload>(
  token: string,
  options: VerifyTokenOptions = {},
) {
  const tokenValue = token.replace(/^Bearer\s+/i, "").trim();
  const parts = tokenValue.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const [encodedHeader, encodedPayload, actualSignature] = parts;
  const secret = getJwtSecret(options.secret);
  const isValidSignature = await verifySignature(
    `${encodedHeader}.${encodedPayload}`,
    actualSignature,
    secret,
  );

  if (!isValidSignature) {
    throw new Error("Invalid JWT signature");
  }

  const header = parseJsonPart<JwtHeader>(encodedHeader, "header");

  if (header.alg !== "HS256" || header.typ !== "JWT") {
    throw new Error("Unsupported JWT algorithm");
  }

  const payload = parseJsonPart<TPayload>(encodedPayload, "payload");
  const now = Math.floor(Date.now() / 1000);

  if (typeof payload.exp === "number" && payload.exp <= now) {
    throw new Error("JWT has expired");
  }

  return payload;
}
