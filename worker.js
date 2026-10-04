const CREATE_PAYMENT_REQUEST_TARGET = "/checkout/v1/payment";
const DOKU_NOTIFICATION_PATH = "/api/doku-notification";
const PAYMENT_STATUS_PATH = "/api/payment-status";
const DOKU_SDK_PATH = "/api/doku-checkout-sdk.js";
const SITE_ORIGIN_DEFAULT = "https://digmarketingmaul.com";
const RESEND_ENDPOINT = "https://api.resend.com/emails";
const RESEND_FROM_DEFAULT = "Maul Digital <order@mail.digmarketingmaul.com>";
const WHATSAPP_NUMBER = "6281296069566";
const COURSE_ACCESS_URL_DEFAULT = "https://course.digmarketingmaul.com/request-access/";
const ADMIN_ORDERS_API_PATH = "/admin/api/orders";
const ADMIN_OVERVIEW_API_PATH = "/admin/api/overview";
const ADMIN_CUSTOMERS_API_PATH = "/admin/api/customers";
const ADMIN_CUSTOMER_API_PATH = "/admin/api/customer";
const ADMIN_SESSIONS_API_PATH = "/admin/api/sessions";
const ADMIN_MAGIC_LINKS_API_PATH = "/admin/api/magic-links";
const ADMIN_ACTIVITY_API_PATH = "/admin/api/activity";
const ADMIN_GRANT_ACCESS_API_PATH = "/admin/api/course/grant-access";
const ADMIN_SEND_MAGIC_LINK_API_PATH = "/admin/api/course/send-magic-link";
const ADMIN_REVOKE_SESSION_API_PATH = "/admin/api/course/revoke-session";
const ADMIN_REVOKE_ACCESS_API_PATH = "/admin/api/course/revoke-access";
const ADMIN_RESTORE_ACCESS_API_PATH = "/admin/api/course/restore-access";
const ADMIN_REVOKE_MAGIC_LINK_API_PATH = "/admin/api/course/revoke-magic-link";
const COURSE_PRODUCT_ID_DEFAULT = "website-course";
const COURSE_BASE_URL_ADMIN_DEFAULT = "https://course.digmarketingmaul.com";
const COURSE_FROM_EMAIL_ADMIN_DEFAULT =
  "Maul Digital Course <course@mail.digmarketingmaul.com>";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

let accessJwksCache = null;
let accessJwksFetchedAt = 0;

const DOKU_ENVIRONMENTS = Object.freeze({
  sandbox: {
    apiBaseUrl: "https://api-sandbox.doku.com",
    checkoutJsUrl:
      "https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js",
  },
  production: {
    apiBaseUrl: "https://api.doku.com",
    checkoutJsUrl:
      "https://jokul.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js",
  },
});

function getDokuEnvironment(env) {
  const name = String(env.DOKU_ENV || "sandbox").trim().toLowerCase();

  if (!DOKU_ENVIRONMENTS[name]) {
    throw new Error(
      `Invalid DOKU_ENV "${name}". Use "sandbox" or "production".`
    );
  }

  return {
    name,
    ...DOKU_ENVIRONMENTS[name],
  };
}

function getDokuPaymentEndpoint(env) {
  const doku = getDokuEnvironment(env);
  return `${doku.apiBaseUrl}${CREATE_PAYMENT_REQUEST_TARGET}`;
}

function parseDokuExpiredDate(expiredDate) {
  const value = String(expiredDate || "").trim();

  // DOKU Checkout expired_date format: yyyyMMddHHmmss, timezone UTC+7.
  if (!/^\d{14}$/.test(value)) return null;

  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);
  const hour = value.slice(8, 10);
  const minute = value.slice(10, 12);
  const second = value.slice(12, 14);

  const parsed = new Date(
    `${year}-${month}-${day}T${hour}:${minute}:${second}+07:00`
  );

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function serveDokuCheckoutSdk(env) {
  const doku = getDokuEnvironment(env);

  /*
   * HTML always loads this same first-party URL.
   * DOKU_ENV decides whether the browser receives Sandbox or Production SDK.
   * This means switching environment later does not require editing HTML.
   */
  return Response.redirect(doku.checkoutJsUrl, 302);
}

/*
 * Product catalog is authoritative on the SERVER.
 * Browser only sends product_id; price/name always come from this map.
 *
 * Only products with confirmed prices are enabled here.
 * Products whose price is still "Rpx.xxx.xxx" remain unavailable.
 */
const WEBSITE_DEVELOPMENT_PAYMENT_METHODS = Object.freeze([
  // Virtual Account / bank-transfer options
  "VIRTUAL_ACCOUNT_BCA",
  "VIRTUAL_ACCOUNT_BANK_MANDIRI",
  "VIRTUAL_ACCOUNT_BANK_SYARIAH_MANDIRI",
  "VIRTUAL_ACCOUNT_DOKU",
  "VIRTUAL_ACCOUNT_BRI",
  "VIRTUAL_ACCOUNT_BNI",
  "VIRTUAL_ACCOUNT_BANK_PERMATA",
  "VIRTUAL_ACCOUNT_BANK_CIMB",
  "VIRTUAL_ACCOUNT_BANK_DANAMON",
  "VIRTUAL_ACCOUNT_MAYBANK",
  "VIRTUAL_ACCOUNT_BNC",
  "VIRTUAL_ACCOUNT_BTN",
  "VIRTUAL_ACCOUNT_SINARMAS",

  // Convenience Store
  "ONLINE_TO_OFFLINE_ALFA",
  "ONLINE_TO_OFFLINE_INDOMARET",
]);

const PRODUCT_CATALOG = Object.freeze({
  "website-course": {
    name: "Panduan Membuat Website Pertama Kamu Live dari 0",
    amount: 899000,
    currency: "IDR",
    emailSubject: "Pembayaran Berhasil — Panduan Membuat Website Pertama Kamu Live dari 0",
    // No paymentMethodTypes: DOKU will show every payment method
    // that is active and available for the Production merchant account.
    postPaymentType: "course",
  },
  "website-development": {
    name: "Website Development",
    amount: 999000,
    currency: "IDR",
    emailSubject: "Pembayaran Berhasil — Website Development",
    paymentMethodTypes: WEBSITE_DEVELOPMENT_PAYMENT_METHODS,
    postPaymentType: "whatsapp",
  },
  "digital-marketing-ebooks": {
    name: "Digital Marketing eBooks",
    amount: 10000,
    currency: "IDR",
    emailSubject: "Pembayaran Berhasil — Digital Marketing eBooks",
    // Intentionally no paymentMethodTypes: DOKU shows all methods enabled
    // and available for this merchant/product.
    postPaymentType: "ebook",
  },
});


function decodeBase64UrlToBytes(value) {
  const normalized = String(value || "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded =
    normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function decodeJwtJson(value) {
  return JSON.parse(
    decoder.decode(decodeBase64UrlToBytes(value))
  );
}

function normalizeAccessTeamDomain(value) {
  return String(value || "").trim().replace(/\/$/, "");
}

function getAdminEmails(env) {
  return String(env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function getAccessJwks(env) {
  const teamDomain = normalizeAccessTeamDomain(env.ACCESS_TEAM_DOMAIN);

  if (!teamDomain) {
    throw new Error("ACCESS_TEAM_DOMAIN is missing");
  }

  const now = Date.now();

  if (
    accessJwksCache &&
    now - accessJwksFetchedAt < 10 * 60 * 1000
  ) {
    return accessJwksCache;
  }

  const response = await fetch(
    `${teamDomain}/cdn-cgi/access/certs`,
    {
      headers: {
        "Accept": "application/json",
      },
      cf: {
        cacheEverything: true,
        cacheTtl: 600,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to load Cloudflare Access JWKS (${response.status})`
    );
  }

  const jwks = await response.json();

  if (!Array.isArray(jwks?.keys) || !jwks.keys.length) {
    throw new Error("Cloudflare Access JWKS is empty");
  }

  accessJwksCache = jwks;
  accessJwksFetchedAt = now;

  return jwks;
}

async function verifyCloudflareAccess(request, env) {
  const teamDomain = normalizeAccessTeamDomain(env.ACCESS_TEAM_DOMAIN);
  const audience = String(env.ACCESS_AUD || "").trim();
  const adminEmails = getAdminEmails(env);

  if (!teamDomain || !audience || !adminEmails.length) {
    throw new Error(
      "Admin Access environment variables are not configured"
    );
  }

  const token = String(
    request.headers.get("Cf-Access-Jwt-Assertion") || ""
  ).trim();

  if (!token) {
    throw new Error("Missing Cloudflare Access JWT");
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid Cloudflare Access JWT");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJwtJson(encodedHeader);
  const payload = decodeJwtJson(encodedPayload);

  if (header?.alg !== "RS256" || !header?.kid) {
    throw new Error("Unsupported Cloudflare Access JWT");
  }

  const jwks = await getAccessJwks(env);
  const jwk = jwks.keys.find((key) => key.kid === header.kid);

  if (!jwk) {
    accessJwksCache = null;
    accessJwksFetchedAt = 0;

    const refreshed = await getAccessJwks(env);
    const refreshedJwk = refreshed.keys.find(
      (key) => key.kid === header.kid
    );

    if (!refreshedJwk) {
      throw new Error("Cloudflare Access signing key not found");
    }

    const key = await crypto.subtle.importKey(
      "jwk",
      refreshedJwk,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      false,
      ["verify"]
    );

    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      decodeBase64UrlToBytes(encodedSignature),
      encoder.encode(`${encodedHeader}.${encodedPayload}`)
    );

    if (!valid) {
      throw new Error("Invalid Cloudflare Access JWT signature");
    }
  } else {
    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      false,
      ["verify"]
    );

    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      decodeBase64UrlToBytes(encodedSignature),
      encoder.encode(`${encodedHeader}.${encodedPayload}`)
    );

    if (!valid) {
      throw new Error("Invalid Cloudflare Access JWT signature");
    }
  }

  const now = Math.floor(Date.now() / 1000);
  const issuer = String(payload?.iss || "").replace(/\/$/, "");
  const tokenAudience = Array.isArray(payload?.aud)
    ? payload.aud
    : [payload?.aud].filter(Boolean);

  if (issuer !== teamDomain) {
    throw new Error("Invalid Cloudflare Access JWT issuer");
  }

  if (!tokenAudience.includes(audience)) {
    throw new Error("Invalid Cloudflare Access JWT audience");
  }

  if (!payload?.exp || Number(payload.exp) <= now) {
    throw new Error("Cloudflare Access JWT has expired");
  }

  if (payload?.nbf && Number(payload.nbf) > now + 30) {
    throw new Error("Cloudflare Access JWT is not active yet");
  }

  const email = String(payload?.email || "").trim().toLowerCase();

  if (!email || !adminEmails.includes(email)) {
    throw new Error("This user is not an authorized admin");
  }

  return {
    email,
    payload,
  };
}

async function getAdminOrders(request, env) {
  if (!env.DB) {
    return jsonResponse(
      {
        success: false,
        error: "D1 binding DB is missing",
      },
      500
    );
  }

  let admin;

  try {
    admin = await verifyCloudflareAccess(request, env);
  } catch (error) {
    console.error("Admin Access verification failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return jsonResponse(
      {
        success: false,
        error: "Unauthorized",
      },
      403
    );
  }

  const url = new URL(request.url);
  const rawStatus = String(
    url.searchParams.get("status") || "ALL"
  ).trim().toUpperCase();

  const allowedStatuses = new Set([
    "ALL",
    "PENDING",
    "SUCCESS",
    "EXPIRED",
    "FAILED",
  ]);

  const status = allowedStatuses.has(rawStatus)
    ? rawStatus
    : "ALL";

  const search = String(
    url.searchParams.get("q") || ""
  ).trim().slice(0, 100);

  const limit = Math.min(
    200,
    Math.max(
      1,
      Number.parseInt(url.searchParams.get("limit") || "100", 10) || 100
    )
  );

  const offset = Math.max(
    0,
    Number.parseInt(url.searchParams.get("offset") || "0", 10) || 0
  );

  const conditions = [];
  const bindings = [];

  if (status !== "ALL") {
    conditions.push("status = ?");
    bindings.push(status);
  }

  if (search) {
    const term = `%${search.toLowerCase()}%`;
    conditions.push(`(
      LOWER(COALESCE(invoice_number, '')) LIKE ?
      OR LOWER(COALESCE(customer_name, '')) LIKE ?
      OR LOWER(COALESCE(customer_email, '')) LIKE ?
      OR LOWER(COALESCE(customer_phone, '')) LIKE ?
      OR LOWER(COALESCE(product_name, '')) LIKE ?
    )`);
    bindings.push(term, term, term, term, term);
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const ordersStatement = env.DB.prepare(
    `SELECT
      id,
      invoice_number,
      customer_name,
      customer_email,
      customer_phone,
      product_id,
      product_name,
      amount,
      currency,
      status,
      payment_channel,
      acquirer,
      created_at,
      updated_at,
      expires_at,
      paid_at,
      email_status,
      email_sent_at
    FROM payments
    ${where}
    ORDER BY id DESC
    LIMIT ? OFFSET ?`
  ).bind(...bindings, limit, offset);

  const countStatement = env.DB.prepare(
    `SELECT COUNT(*) AS total
     FROM payments
     ${where}`
  ).bind(...bindings);

  const summaryStatement = env.DB.prepare(
    `SELECT
      COUNT(*) AS total_orders,
      SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) AS success_orders,
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_orders,
      SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END) AS expired_orders,
      COALESCE(
        SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END),
        0
      ) AS success_value
    FROM payments`
  );

  const [ordersResult, countResult, summary] = await Promise.all([
    ordersStatement.all(),
    countStatement.first(),
    summaryStatement.first(),
  ]);

  return jsonResponse({
    success: true,
    admin_email: admin.email,
    filters: {
      status,
      q: search,
      limit,
      offset,
    },
    summary: {
      total_orders: Number(summary?.total_orders || 0),
      success_orders: Number(summary?.success_orders || 0),
      pending_orders: Number(summary?.pending_orders || 0),
      expired_orders: Number(summary?.expired_orders || 0),
      success_value: Number(summary?.success_value || 0),
    },
    total: Number(countResult?.total || 0),
    orders: ordersResult?.results || [],
  });
}


async function authorizeAdminRequest(request, env) {
  if (!env.DB) {
    return {
      response: jsonResponse(
        { success: false, error: "D1 binding DB is missing" },
        500
      ),
    };
  }

  try {
    const admin = await verifyCloudflareAccess(request, env);
    return { admin };
  } catch (error) {
    console.error("Admin Access verification failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      response: jsonResponse(
        { success: false, error: "Unauthorized" },
        403
      ),
    };
  }
}

function adminCourseProductId(env) {
  return String(
    env.COURSE_PRODUCT_ID || COURSE_PRODUCT_ID_DEFAULT
  ).trim() || COURSE_PRODUCT_ID_DEFAULT;
}

function adminCourseBaseUrl(env) {
  return String(
    env.COURSE_BASE_URL || COURSE_BASE_URL_ADMIN_DEFAULT
  ).trim().replace(/\/$/, "");
}

function randomTokenBase64Url(bytes = 32) {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);

  let binary = "";
  for (const byte of data) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function sha256HexAdmin(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(String(value || ""))
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function ensureCourseAdminTables(env) {
  await env.DB.batch([
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS course_admin_grants (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        product_id TEXT NOT NULL,
        access_type TEXT NOT NULL DEFAULT 'MANUAL',
        note TEXT,
        granted_by TEXT NOT NULL,
        granted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        revoked_at TEXT,
        UNIQUE(email, product_id)
      )`
    ),
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS course_admin_audit (
        id TEXT PRIMARY KEY,
        admin_email TEXT NOT NULL,
        action TEXT NOT NULL,
        target_email TEXT,
        product_id TEXT,
        details TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    ),
    env.DB.prepare(
      `CREATE INDEX IF NOT EXISTS idx_course_admin_audit_target
       ON course_admin_audit(target_email, created_at)`
    ),
    env.DB.prepare(
      `CREATE INDEX IF NOT EXISTS idx_course_admin_grants_email
       ON course_admin_grants(email, product_id)`
    ),
  ]);
}

async function writeCourseAdminAudit(
  env,
  adminEmail,
  action,
  targetEmail,
  productId,
  details = {}
) {
  await ensureCourseAdminTables(env);

  await env.DB.prepare(
    `INSERT INTO course_admin_audit
      (id, admin_email, action, target_email, product_id, details)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(
      crypto.randomUUID(),
      String(adminEmail || "").toLowerCase(),
      String(action || "").slice(0, 80),
      targetEmail ? normalizeEmail(targetEmail) : null,
      productId || null,
      JSON.stringify(details || {}).slice(0, 4000)
    )
    .run();
}

async function getTableInfo(env, tableName) {
  if (!/^[a-z0-9_]+$/i.test(tableName)) {
    throw new Error("Invalid table name");
  }

  const result = await env.DB.prepare(
    `PRAGMA table_info(${tableName})`
  ).all();

  return result?.results || [];
}

async function activateCourseEntitlement(env, email, productId) {
  const normalized = normalizeEmail(email);

  const existing = await env.DB.prepare(
    `SELECT *
     FROM course_entitlements
     WHERE lower(email) = lower(?)
       AND product_id = ?
     LIMIT 1`
  )
    .bind(normalized, productId)
    .first();

  const columns = await getTableInfo(env, "course_entitlements");
  const columnNames = new Set(columns.map((column) => column.name));

  if (existing) {
    const sets = ["status = 'ACTIVE'"];
    if (columnNames.has("updated_at")) {
      sets.push("updated_at = CURRENT_TIMESTAMP");
    }

    await env.DB.prepare(
      `UPDATE course_entitlements
       SET ${sets.join(", ")}
       WHERE lower(email) = lower(?)
         AND product_id = ?`
    )
      .bind(normalized, productId)
      .run();

    return { created: false };
  }

  const insertColumns = [];
  const valueSql = [];
  const bindings = [];
  const manualReference = `ADMIN-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

  function addValue(name, value) {
    if (!columnNames.has(name)) return;
    insertColumns.push(name);
    valueSql.push("?");
    bindings.push(value);
  }

  function addSql(name, sql) {
    if (!columnNames.has(name)) return;
    insertColumns.push(name);
    valueSql.push(sql);
  }

  addValue("email", normalized);
  addValue("product_id", productId);
  addValue("status", "ACTIVE");

  const idColumn = columns.find((column) => column.name === "id");
  if (
    idColumn &&
    !String(idColumn.type || "").toUpperCase().includes("INT") &&
    !idColumn.dflt_value
  ) {
    addValue("id", crypto.randomUUID());
  }

  for (const invoiceColumn of [
    "invoice_number",
    "payment_invoice",
    "source_invoice",
    "invoice",
  ]) {
    addValue(invoiceColumn, manualReference);
  }

  for (const sourceColumn of [
    "source",
    "access_source",
    "grant_source",
  ]) {
    addValue(sourceColumn, "MANUAL");
  }

  addSql("created_at", "CURRENT_TIMESTAMP");
  addSql("updated_at", "CURRENT_TIMESTAMP");

  const handled = new Set(insertColumns);
  for (const column of columns) {
    const name = String(column.name || "");
    const type = String(column.type || "").toUpperCase();
    const isIntegerPrimaryKey =
      Number(column.pk || 0) === 1 && type.includes("INT");

    if (
      handled.has(name) ||
      isIntegerPrimaryKey ||
      column.dflt_value != null ||
      Number(column.notnull || 0) !== 1
    ) {
      continue;
    }

    if (type.includes("TEXT") || type === "") {
      insertColumns.push(name);
      valueSql.push("?");
      bindings.push(
        name.toLowerCase().includes("invoice")
          ? manualReference
          : "ADMIN"
      );
      handled.add(name);
      continue;
    }

    throw new Error(
      `course_entitlements column "${name}" requires a value before manual grants can be created`
    );
  }

  if (
    !insertColumns.includes("email") ||
    !insertColumns.includes("product_id") ||
    !insertColumns.includes("status")
  ) {
    throw new Error(
      "course_entitlements schema is missing email, product_id, or status"
    );
  }

  await env.DB.prepare(
    `INSERT INTO course_entitlements
      (${insertColumns.join(", ")})
     VALUES
      (${valueSql.join(", ")})`
  )
    .bind(...bindings)
    .run();

  return { created: true };
}

async function setCourseEntitlementStatus(
  env,
  email,
  productId,
  status
) {
  const columns = await getTableInfo(env, "course_entitlements");
  const columnNames = new Set(columns.map((column) => column.name));
  const sets = ["status = ?"];
  const bindings = [status];

  if (columnNames.has("updated_at")) {
    sets.push("updated_at = CURRENT_TIMESTAMP");
  }

  const result = await env.DB.prepare(
    `UPDATE course_entitlements
     SET ${sets.join(", ")}
     WHERE lower(email) = lower(?)
       AND product_id = ?`
  )
    .bind(...bindings, normalizeEmail(email), productId)
    .run();

  return Number(result?.meta?.changes || 0);
}

async function createAdminMagicLink(env, email, productId) {
  const normalized = normalizeEmail(email);

  const entitlement = await env.DB.prepare(
    `SELECT id
     FROM course_entitlements
     WHERE lower(email) = lower(?)
       AND product_id = ?
       AND status = 'ACTIVE'
     LIMIT 1`
  )
    .bind(normalized, productId)
    .first();

  if (!entitlement) {
    throw new Error("Customer does not have ACTIVE course access");
  }

  // Keep the same single-current-link behavior as the course Worker.
  await env.DB.prepare(
    `UPDATE course_magic_links
     SET used_at = COALESCE(used_at, CURRENT_TIMESTAMP)
     WHERE lower(email) = lower(?)
       AND product_id = ?
       AND used_at IS NULL`
  )
    .bind(normalized, productId)
    .run();

  const token = randomTokenBase64Url(32);
  const tokenHash = await sha256HexAdmin(token);
  const id = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO course_magic_links
      (id, email, product_id, token_hash, expires_at)
     VALUES
      (?, ?, ?, ?, datetime('now', '+86400 seconds'))`
  )
    .bind(id, normalized, productId, tokenHash)
    .run();

  return {
    id,
    url:
      `${adminCourseBaseUrl(env)}/auth/verify?token=${encodeURIComponent(token)}`,
  };
}

async function sendAdminCourseMagicLinkEmail(env, email, magicUrl) {
  if (!env.RESEND_API_KEY) {
    return {
      sent: false,
      error: "RESEND_API_KEY is not configured on digmarketingmaul-website",
    };
  }

  const from =
    env.COURSE_FROM_EMAIL ||
    COURSE_FROM_EMAIL_ADMIN_DEFAULT;

  const subject = "Link Akses Course — Website Pertama Kamu";

  const html = `<!doctype html>
<html lang="id">
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827">
    <div style="max-width:620px;margin:0 auto;padding:36px 20px">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;padding:32px">
        <div style="font-size:20px;font-weight:800;margin-bottom:26px">M. Maul Digital</div>
        <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px">Link akses course kamu</h1>
        <p style="font-size:16px;line-height:1.7;margin:0 0 18px">
          Gunakan tombol di bawah untuk membuka course <strong>Website Pertama Kamu</strong>.
        </p>
        <p style="font-size:16px;line-height:1.7;margin:0 0 26px">
          Magic link ini hanya dapat digunakan satu kali dan berlaku selama <strong>24 jam</strong>.
        </p>
        <p style="margin:0 0 28px">
          <a href="${escapeHtml(magicUrl)}"
             style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 20px;border-radius:10px">
            Buka Course
          </a>
        </p>
        <div style="border-top:1px solid #e5e7eb;padding-top:20px;font-size:13px;line-height:1.6;color:#6b7280">
          Jika kamu tidak meminta link ini, abaikan email ini. Jangan teruskan magic link kepada orang lain.
        </div>
      </div>
    </div>
  </body>
</html>`;

  const text = [
    "Link akses course kamu",
    "",
    "Gunakan link berikut untuk membuka course Website Pertama Kamu:",
    magicUrl,
    "",
    "Magic link hanya dapat digunakan satu kali dan berlaku selama 24 jam.",
    "Jika kamu tidak meminta link ini, abaikan email ini.",
  ].join("\n");

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [normalizeEmail(email)],
        subject,
        html,
        text,
      }),
    });

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }

    if (!response.ok) {
      return {
        sent: false,
        error:
          data?.message ||
          data?.error?.message ||
          `Resend HTTP ${response.status}`,
      };
    }

    return {
      sent: true,
      id: data?.id || null,
    };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function adminRiskFromCustomer(row) {
  const sessions7d = Number(row?.sessions_7d || 0);
  const sessions30d = Number(row?.sessions_30d || 0);
  const devices30d = Number(row?.devices_30d || 0);
  const magic30d = Number(row?.magic_links_30d || 0);

  if (
    sessions7d >= 8 ||
    sessions30d >= 15 ||
    devices30d >= 7 ||
    magic30d >= 15
  ) {
    return "HIGH_ACTIVITY";
  }

  if (
    sessions7d >= 5 ||
    sessions30d >= 10 ||
    devices30d >= 4 ||
    magic30d >= 9
  ) {
    return "REVIEW";
  }

  return "NORMAL";
}

async function getAdminCourseCustomers(request, env) {
  const auth = await authorizeAdminRequest(request, env);
  if (auth.response) return auth.response;

  await ensureCourseAdminTables(env);

  const url = new URL(request.url);
  const search = String(url.searchParams.get("q") || "")
    .trim()
    .toLowerCase()
    .slice(0, 120);
  const requestedStatus = String(
    url.searchParams.get("status") || "ALL"
  ).toUpperCase();
  const requestedRisk = String(
    url.searchParams.get("risk") || "ALL"
  ).toUpperCase();

  const status =
    requestedStatus === "ACTIVE" || requestedStatus === "REVOKED"
      ? requestedStatus
      : "ALL";

  const productId = adminCourseProductId(env);

  const result = await env.DB.prepare(
    `WITH session_stats AS (
       SELECT
         lower(email) AS email_key,
         product_id,
         COUNT(*) AS total_sessions,
         SUM(CASE
           WHEN created_at >= datetime('now', '-7 days') THEN 1 ELSE 0
         END) AS sessions_7d,
         SUM(CASE
           WHEN created_at >= datetime('now', '-30 days') THEN 1 ELSE 0
         END) AS sessions_30d,
         COUNT(DISTINCT CASE
           WHEN created_at >= datetime('now', '-30 days')
           THEN COALESCE(NULLIF(user_agent, ''), 'unknown')
           ELSE NULL
         END) AS devices_30d,
         SUM(CASE
           WHEN status = 'ACTIVE'
             AND expires_at > CURRENT_TIMESTAMP
           THEN 1 ELSE 0
         END) AS active_sessions,
         MAX(last_seen_at) AS last_seen_at,
         MAX(created_at) AS latest_session_at
       FROM course_sessions
       GROUP BY lower(email), product_id
     ),
     magic_stats AS (
       SELECT
         lower(email) AS email_key,
         product_id,
         COUNT(*) AS total_magic_links,
         SUM(CASE
           WHEN created_at >= datetime('now', '-30 days') THEN 1 ELSE 0
         END) AS magic_links_30d,
         MAX(created_at) AS latest_magic_link_at
       FROM course_magic_links
       GROUP BY lower(email), product_id
     ),
     latest_payment AS (
       SELECT p.*
       FROM payments p
       INNER JOIN (
         SELECT
           lower(customer_email) AS email_key,
           product_id,
           MAX(id) AS max_id
         FROM payments
         WHERE status = 'SUCCESS'
           AND product_id = ?
         GROUP BY lower(customer_email), product_id
       ) latest
         ON p.id = latest.max_id
     )
     SELECT
       ce.id AS entitlement_id,
       ce.email,
       ce.product_id,
       ce.status AS entitlement_status,
       p.invoice_number,
       p.amount AS paid_amount,
       p.paid_at,
       p.customer_name,
       g.access_type,
       g.note AS access_note,
       g.granted_by,
       g.granted_at,
       g.revoked_at AS admin_grant_revoked_at,
       COALESCE(ss.total_sessions, 0) AS total_sessions,
       COALESCE(ss.sessions_7d, 0) AS sessions_7d,
       COALESCE(ss.sessions_30d, 0) AS sessions_30d,
       COALESCE(ss.devices_30d, 0) AS devices_30d,
       COALESCE(ss.active_sessions, 0) AS active_sessions,
       ss.last_seen_at,
       ss.latest_session_at,
       COALESCE(ms.total_magic_links, 0) AS total_magic_links,
       COALESCE(ms.magic_links_30d, 0) AS magic_links_30d,
       ms.latest_magic_link_at
     FROM course_entitlements ce
     LEFT JOIN latest_payment p
       ON lower(p.customer_email) = lower(ce.email)
      AND p.product_id = ce.product_id
     LEFT JOIN course_admin_grants g
       ON lower(g.email) = lower(ce.email)
      AND g.product_id = ce.product_id
     LEFT JOIN session_stats ss
       ON ss.email_key = lower(ce.email)
      AND ss.product_id = ce.product_id
     LEFT JOIN magic_stats ms
       ON ms.email_key = lower(ce.email)
      AND ms.product_id = ce.product_id
     WHERE ce.product_id = ?
     ORDER BY
       CASE WHEN ce.status = 'ACTIVE' THEN 0 ELSE 1 END,
       COALESCE(ss.last_seen_at, g.granted_at, p.paid_at) DESC,
       ce.email ASC`
  )
    .bind(productId, productId)
    .all();

  let customers = (result?.results || []).map((row) => {
    const accessSource =
      row.access_type ||
      (row.invoice_number ? "PAID" : "MANUAL");

    return {
      ...row,
      access_source: accessSource,
      risk: adminRiskFromCustomer(row),
    };
  });

  if (status !== "ALL") {
    customers = customers.filter(
      (row) =>
        String(row.entitlement_status || "").toUpperCase() === status
    );
  }

  if (requestedRisk !== "ALL") {
    customers = customers.filter(
      (row) => row.risk === requestedRisk
    );
  }

  if (search) {
    customers = customers.filter((row) =>
      [
        row.email,
        row.customer_name,
        row.invoice_number,
        row.access_source,
      ]
        .map((value) => String(value || "").toLowerCase())
        .some((value) => value.includes(search))
    );
  }

  const summary = {
    total: customers.length,
    active: customers.filter(
      (row) => row.entitlement_status === "ACTIVE"
    ).length,
    review: customers.filter(
      (row) => row.risk === "REVIEW"
    ).length,
    high_activity: customers.filter(
      (row) => row.risk === "HIGH_ACTIVITY"
    ).length,
  };

  return jsonResponse({
    success: true,
    admin_email: auth.admin.email,
    summary,
    customers,
  });
}

async function getAdminCourseCustomer(request, env) {
  const auth = await authorizeAdminRequest(request, env);
  if (auth.response) return auth.response;

  await ensureCourseAdminTables(env);

  const url = new URL(request.url);
  const email = normalizeEmail(url.searchParams.get("email"));
  const productId = adminCourseProductId(env);

  if (!isValidEmail(email)) {
    return jsonResponse(
      { success: false, error: "Valid customer email is required" },
      400
    );
  }

  const entitlement = await env.DB.prepare(
    `SELECT *
     FROM course_entitlements
     WHERE lower(email) = lower(?)
       AND product_id = ?
     LIMIT 1`
  )
    .bind(email, productId)
    .first();

  if (!entitlement) {
    return jsonResponse(
      { success: false, error: "Customer entitlement not found" },
      404
    );
  }

  const [payments, sessions, magicLinks, grant, audit] =
    await Promise.all([
      env.DB.prepare(
        `SELECT
           invoice_number,
           product_name,
           amount,
           currency,
           status,
           payment_channel,
           created_at,
           paid_at
         FROM payments
         WHERE lower(customer_email) = lower(?)
           AND product_id = ?
         ORDER BY id DESC
         LIMIT 30`
      )
        .bind(email, productId)
        .all(),
      env.DB.prepare(
        `SELECT
           id,
           status,
           created_at,
           expires_at,
           last_seen_at,
           revoked_at,
           user_agent
         FROM course_sessions
         WHERE lower(email) = lower(?)
           AND product_id = ?
         ORDER BY created_at DESC
         LIMIT 100`
      )
        .bind(email, productId)
        .all(),
      env.DB.prepare(
        `SELECT
           id,
           created_at,
           expires_at,
           used_at,
           CASE
             WHEN used_at IS NOT NULL THEN 'USED'
             WHEN expires_at <= CURRENT_TIMESTAMP THEN 'EXPIRED'
             ELSE 'ACTIVE'
           END AS link_status
         FROM course_magic_links
         WHERE lower(email) = lower(?)
           AND product_id = ?
         ORDER BY created_at DESC
         LIMIT 100`
      )
        .bind(email, productId)
        .all(),
      env.DB.prepare(
        `SELECT *
         FROM course_admin_grants
         WHERE lower(email) = lower(?)
           AND product_id = ?
         LIMIT 1`
      )
        .bind(email, productId)
        .first(),
      env.DB.prepare(
        `SELECT
           id,
           admin_email,
           action,
           details,
           created_at
         FROM course_admin_audit
         WHERE lower(target_email) = lower(?)
           AND product_id = ?
         ORDER BY created_at DESC
         LIMIT 100`
      )
        .bind(email, productId)
        .all(),
    ]);

  const sessionRows = sessions?.results || [];
  const magicRows = magicLinks?.results || [];
  const riskRow = {
    sessions_7d: sessionRows.filter(
      (row) => adminDateIsWithinDays(row.created_at, 7)
    ).length,
    sessions_30d: sessionRows.filter(
      (row) => adminDateIsWithinDays(row.created_at, 30)
    ).length,
    devices_30d: new Set(
      sessionRows
        .filter((row) => adminDateIsWithinDays(row.created_at, 30))
        .map((row) => row.user_agent || "unknown")
    ).size,
    magic_links_30d: magicRows.filter(
      (row) => adminDateIsWithinDays(row.created_at, 30)
    ).length,
  };

  return jsonResponse({
    success: true,
    admin_email: auth.admin.email,
    customer: {
      email,
      product_id: productId,
      entitlement,
      grant: grant || null,
      access_source:
        grant?.access_type ||
        ((payments?.results || []).some(
          (row) => row.status === "SUCCESS"
        )
          ? "PAID"
          : "MANUAL"),
      risk: adminRiskFromCustomer(riskRow),
      risk_metrics: {
        ...riskRow,
        total_sessions: sessionRows.length,
        total_magic_links: magicRows.length,
      },
      payments: payments?.results || [],
      sessions: sessionRows,
      magic_links: magicRows,
      audit: audit?.results || [],
    },
  });
}

function adminDateIsWithinDays(value, days) {
  if (!value) return false;
  const normalized = String(value).includes("T")
    ? String(value)
    : `${String(value).replace(" ", "T")}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() <= days * 86400000;
}

async function getAdminCourseSessions(request, env) {
  const auth = await authorizeAdminRequest(request, env);
  if (auth.response) return auth.response;

  const url = new URL(request.url);
  const q = String(url.searchParams.get("q") || "")
    .trim()
    .toLowerCase()
    .slice(0, 120);
  const requestedStatus = String(
    url.searchParams.get("status") || "ALL"
  ).toUpperCase();

  const status = ["ALL", "ACTIVE", "REVOKED"].includes(
    requestedStatus
  )
    ? requestedStatus
    : "ALL";

  const conditions = ["product_id = ?"];
  const bindings = [adminCourseProductId(env)];

  if (status === "ACTIVE") {
    conditions.push(
      "status = 'ACTIVE' AND expires_at > CURRENT_TIMESTAMP"
    );
  } else if (status === "REVOKED") {
    conditions.push(
      "(status = 'REVOKED' OR expires_at <= CURRENT_TIMESTAMP)"
    );
  }

  if (q) {
    conditions.push(
      `(lower(email) LIKE ? OR lower(COALESCE(user_agent, '')) LIKE ?)`
    );
    const term = `%${q}%`;
    bindings.push(term, term);
  }

  const result = await env.DB.prepare(
    `SELECT
       id,
       email,
       product_id,
       status,
       created_at,
       expires_at,
       last_seen_at,
       revoked_at,
       user_agent,
       CASE
         WHEN status = 'ACTIVE'
          AND expires_at > CURRENT_TIMESTAMP
         THEN 'ACTIVE'
         WHEN status = 'REVOKED' THEN 'REVOKED'
         ELSE 'EXPIRED'
       END AS display_status
     FROM course_sessions
     WHERE ${conditions.join(" AND ")}
     ORDER BY created_at DESC
     LIMIT 500`
  )
    .bind(...bindings)
    .all();

  return jsonResponse({
    success: true,
    admin_email: auth.admin.email,
    sessions: result?.results || [],
  });
}

async function getAdminCourseMagicLinks(request, env) {
  const auth = await authorizeAdminRequest(request, env);
  if (auth.response) return auth.response;

  const url = new URL(request.url);
  const q = String(url.searchParams.get("q") || "")
    .trim()
    .toLowerCase()
    .slice(0, 120);
  const requestedStatus = String(
    url.searchParams.get("status") || "ALL"
  ).toUpperCase();
  const allowed = ["ALL", "ACTIVE", "USED", "EXPIRED"];
  const status = allowed.includes(requestedStatus)
    ? requestedStatus
    : "ALL";

  const conditions = ["product_id = ?"];
  const bindings = [adminCourseProductId(env)];

  if (q) {
    conditions.push("lower(email) LIKE ?");
    bindings.push(`%${q}%`);
  }

  const result = await env.DB.prepare(
    `SELECT
       id,
       email,
       product_id,
       created_at,
       expires_at,
       used_at,
       CASE
         WHEN used_at IS NOT NULL THEN 'USED'
         WHEN expires_at <= CURRENT_TIMESTAMP THEN 'EXPIRED'
         ELSE 'ACTIVE'
       END AS display_status
     FROM course_magic_links
     WHERE ${conditions.join(" AND ")}
     ORDER BY created_at DESC
     LIMIT 500`
  )
    .bind(...bindings)
    .all();

  let links = result?.results || [];

  if (status !== "ALL") {
    links = links.filter(
      (row) => row.display_status === status
    );
  }

  return jsonResponse({
    success: true,
    admin_email: auth.admin.email,
    magic_links: links,
  });
}

async function getAdminCourseActivity(request, env) {
  const auth = await authorizeAdminRequest(request, env);
  if (auth.response) return auth.response;

  await ensureCourseAdminTables(env);

  const url = new URL(request.url);
  const q = String(url.searchParams.get("q") || "")
    .trim()
    .toLowerCase()
    .slice(0, 120);

  const conditions = [];
  const bindings = [];

  if (q) {
    conditions.push(
      `(lower(COALESCE(target_email, '')) LIKE ?
        OR lower(COALESCE(admin_email, '')) LIKE ?
        OR lower(COALESCE(action, '')) LIKE ?)`
    );
    const term = `%${q}%`;
    bindings.push(term, term, term);
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const result = await env.DB.prepare(
    `SELECT
       id,
       admin_email,
       action,
       target_email,
       product_id,
       details,
       created_at
     FROM course_admin_audit
     ${where}
     ORDER BY created_at DESC
     LIMIT 500`
  )
    .bind(...bindings)
    .all();

  return jsonResponse({
    success: true,
    admin_email: auth.admin.email,
    activity: result?.results || [],
  });
}

async function getAdminCourseOverview(request, env) {
  const auth = await authorizeAdminRequest(request, env);
  if (auth.response) return auth.response;

  await ensureCourseAdminTables(env);

  const productId = adminCourseProductId(env);

  const [
    entitlementSummary,
    sessionSummary,
    magicSummary,
    grantSummary,
    recentEntitlements,
    securityRows,
  ] = await Promise.all([
    env.DB.prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active,
         SUM(CASE WHEN status <> 'ACTIVE' THEN 1 ELSE 0 END) AS inactive
       FROM course_entitlements
       WHERE product_id = ?`
    )
      .bind(productId)
      .first(),
    env.DB.prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE
           WHEN status = 'ACTIVE' AND expires_at > CURRENT_TIMESTAMP
           THEN 1 ELSE 0
         END) AS active,
         SUM(CASE
           WHEN created_at >= datetime('now', '-30 days')
           THEN 1 ELSE 0
         END) AS created_30d
       FROM course_sessions
       WHERE product_id = ?`
    )
      .bind(productId)
      .first(),
    env.DB.prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE
           WHEN created_at >= datetime('now', '-30 days')
           THEN 1 ELSE 0
         END) AS created_30d,
         SUM(CASE
           WHEN used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
           THEN 1 ELSE 0
         END) AS active
       FROM course_magic_links
       WHERE product_id = ?`
    )
      .bind(productId)
      .first(),
    env.DB.prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN revoked_at IS NULL THEN 1 ELSE 0 END) AS active
       FROM course_admin_grants
       WHERE product_id = ?`
    )
      .bind(productId)
      .first(),
    env.DB.prepare(
      `SELECT
         ce.email,
         ce.status AS entitlement_status,
         g.access_type,
         g.granted_at,
         (
           SELECT MAX(p.paid_at)
           FROM payments p
           WHERE lower(p.customer_email) = lower(ce.email)
             AND p.product_id = ce.product_id
             AND p.status = 'SUCCESS'
         ) AS paid_at,
         (
           SELECT MAX(cs.last_seen_at)
           FROM course_sessions cs
           WHERE lower(cs.email) = lower(ce.email)
             AND cs.product_id = ce.product_id
         ) AS last_seen_at
       FROM course_entitlements ce
       LEFT JOIN course_admin_grants g
         ON lower(g.email) = lower(ce.email)
        AND g.product_id = ce.product_id
       WHERE ce.product_id = ?
       ORDER BY COALESCE(
         last_seen_at,
         g.granted_at,
         paid_at
       ) DESC
       LIMIT 8`
    )
      .bind(productId)
      .all(),
    env.DB.prepare(
      `SELECT
         email,
         COUNT(*) AS total_sessions,
         SUM(CASE
           WHEN created_at >= datetime('now', '-7 days') THEN 1 ELSE 0
         END) AS sessions_7d,
         SUM(CASE
           WHEN created_at >= datetime('now', '-30 days') THEN 1 ELSE 0
         END) AS sessions_30d,
         COUNT(DISTINCT CASE
           WHEN created_at >= datetime('now', '-30 days')
           THEN COALESCE(NULLIF(user_agent, ''), 'unknown')
           ELSE NULL
         END) AS devices_30d
       FROM course_sessions
       WHERE product_id = ?
       GROUP BY lower(email)`
    )
      .bind(productId)
      .all(),
  ]);

  const security = (securityRows?.results || []).map((row) => ({
    ...row,
    risk: adminRiskFromCustomer(row),
  }));

  return jsonResponse({
    success: true,
    admin_email: auth.admin.email,
    summary: {
      customers_total: Number(entitlementSummary?.total || 0),
      customers_active: Number(entitlementSummary?.active || 0),
      customers_inactive: Number(entitlementSummary?.inactive || 0),
      sessions_total: Number(sessionSummary?.total || 0),
      sessions_active: Number(sessionSummary?.active || 0),
      sessions_30d: Number(sessionSummary?.created_30d || 0),
      magic_links_total: Number(magicSummary?.total || 0),
      magic_links_active: Number(magicSummary?.active || 0),
      magic_links_30d: Number(magicSummary?.created_30d || 0),
      manual_grants_total: Number(grantSummary?.total || 0),
      manual_grants_active: Number(grantSummary?.active || 0),
      review_customers: security.filter(
        (row) => row.risk === "REVIEW"
      ).length,
      high_activity_customers: security.filter(
        (row) => row.risk === "HIGH_ACTIVITY"
      ).length,
    },
    recent_customers: recentEntitlements?.results || [],
  });
}

async function handleAdminGrantAccess(request, env) {
  const auth = await authorizeAdminRequest(request, env);
  if (auth.response) return auth.response;

  const sameOrigin = validateAdminMutationOrigin(request);
  if (!sameOrigin.ok) return sameOrigin.response;

  await ensureCourseAdminTables(env);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(
      { success: false, error: "Invalid JSON body" },
      400
    );
  }

  const email = normalizeEmail(payload?.email);
  const accessType = String(
    payload?.access_type || "GIFT"
  )
    .trim()
    .toUpperCase()
    .slice(0, 24);
  const note = String(payload?.note || "").trim().slice(0, 500);
  const sendMagicLink = payload?.send_magic_link !== false;
  const productId = adminCourseProductId(env);

  if (!isValidEmail(email)) {
    return jsonResponse(
      { success: false, error: "Valid email is required" },
      400
    );
  }

  if (!["GIFT", "MANUAL", "PROMO"].includes(accessType)) {
    return jsonResponse(
      {
        success: false,
        error: "access_type must be GIFT, MANUAL, or PROMO",
      },
      400
    );
  }

  try {
    const entitlementResult =
      await activateCourseEntitlement(env, email, productId);

    await env.DB.prepare(
      `INSERT INTO course_admin_grants
        (id, email, product_id, access_type, note, granted_by, granted_at, revoked_at)
       VALUES
        (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, NULL)
       ON CONFLICT(email, product_id) DO UPDATE SET
         access_type = excluded.access_type,
         note = excluded.note,
         granted_by = excluded.granted_by,
         granted_at = CURRENT_TIMESTAMP,
         revoked_at = NULL`
    )
      .bind(
        crypto.randomUUID(),
        email,
        productId,
        accessType,
        note || null,
        auth.admin.email
      )
      .run();

    let emailResult = null;

    if (sendMagicLink) {
      const magic = await createAdminMagicLink(
        env,
        email,
        productId
      );
      emailResult = await sendAdminCourseMagicLinkEmail(
        env,
        email,
        magic.url
      );
    }

    await writeCourseAdminAudit(
      env,
      auth.admin.email,
      sendMagicLink
        ? "GRANT_ACCESS_AND_SEND_MAGIC_LINK"
        : "GRANT_ACCESS",
      email,
      productId,
      {
        access_type: accessType,
        note: note || null,
        entitlement_created: entitlementResult.created,
        email_sent: emailResult?.sent ?? null,
        email_error: emailResult?.error || null,
      }
    );

    return jsonResponse({
      success: true,
      email,
      access_type: accessType,
      entitlement_created: entitlementResult.created,
      magic_link_sent: emailResult?.sent ?? false,
      email_error: emailResult?.error || null,
    });
  } catch (error) {
    console.error("Admin grant access failed", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error
          ? error.message
          : "Failed to grant course access",
      },
      500
    );
  }
}

async function handleAdminSendMagicLink(request, env) {
  const auth = await authorizeAdminRequest(request, env);
  if (auth.response) return auth.response;

  const sameOrigin = validateAdminMutationOrigin(request);
  if (!sameOrigin.ok) return sameOrigin.response;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(
      { success: false, error: "Invalid JSON body" },
      400
    );
  }

  const email = normalizeEmail(payload?.email);
  const productId = adminCourseProductId(env);

  if (!isValidEmail(email)) {
    return jsonResponse(
      { success: false, error: "Valid email is required" },
      400
    );
  }

  try {
    const magic = await createAdminMagicLink(
      env,
      email,
      productId
    );
    const emailResult = await sendAdminCourseMagicLinkEmail(
      env,
      email,
      magic.url
    );

    await writeCourseAdminAudit(
      env,
      auth.admin.email,
      "SEND_MAGIC_LINK",
      email,
      productId,
      {
        email_sent: emailResult.sent,
        email_error: emailResult.error || null,
      }
    );

    return jsonResponse({
      success: emailResult.sent,
      magic_link_created: true,
      email_sent: emailResult.sent,
      error: emailResult.sent
        ? undefined
        : emailResult.error || "Email delivery failed",
    }, emailResult.sent ? 200 : 502);
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error
          ? error.message
          : "Failed to send magic link",
      },
      400
    );
  }
}

async function handleAdminRevokeSession(request, env) {
  const auth = await authorizeAdminRequest(request, env);
  if (auth.response) return auth.response;

  const sameOrigin = validateAdminMutationOrigin(request);
  if (!sameOrigin.ok) return sameOrigin.response;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(
      { success: false, error: "Invalid JSON body" },
      400
    );
  }

  const sessionId = String(payload?.session_id || "").trim();
  if (!sessionId) {
    return jsonResponse(
      { success: false, error: "session_id is required" },
      400
    );
  }

  const session = await env.DB.prepare(
    `SELECT id, email, product_id, status
     FROM course_sessions
     WHERE id = ?
     LIMIT 1`
  )
    .bind(sessionId)
    .first();

  if (!session) {
    return jsonResponse(
      { success: false, error: "Session not found" },
      404
    );
  }

  await env.DB.prepare(
    `UPDATE course_sessions
     SET status = 'REVOKED',
         revoked_at = COALESCE(revoked_at, CURRENT_TIMESTAMP),
         last_seen_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(sessionId)
    .run();

  await writeCourseAdminAudit(
    env,
    auth.admin.email,
    "REVOKE_SESSION",
    session.email,
    session.product_id,
    { session_id: sessionId }
  );

  return jsonResponse({ success: true });
}

async function handleAdminRevokeAccess(request, env) {
  const auth = await authorizeAdminRequest(request, env);
  if (auth.response) return auth.response;

  const sameOrigin = validateAdminMutationOrigin(request);
  if (!sameOrigin.ok) return sameOrigin.response;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(
      { success: false, error: "Invalid JSON body" },
      400
    );
  }

  const email = normalizeEmail(payload?.email);
  const reason = String(payload?.reason || "")
    .trim()
    .slice(0, 500);
  const productId = adminCourseProductId(env);

  if (!isValidEmail(email)) {
    return jsonResponse(
      { success: false, error: "Valid email is required" },
      400
    );
  }

  const changed = await setCourseEntitlementStatus(
    env,
    email,
    productId,
    "REVOKED"
  );

  if (!changed) {
    return jsonResponse(
      { success: false, error: "Course entitlement not found" },
      404
    );
  }

  await env.DB.batch([
    env.DB.prepare(
      `UPDATE course_sessions
       SET status = 'REVOKED',
           revoked_at = COALESCE(revoked_at, CURRENT_TIMESTAMP),
           last_seen_at = CURRENT_TIMESTAMP
       WHERE lower(email) = lower(?)
         AND product_id = ?
         AND status = 'ACTIVE'`
    ).bind(email, productId),
    env.DB.prepare(
      `UPDATE course_magic_links
       SET used_at = COALESCE(used_at, CURRENT_TIMESTAMP)
       WHERE lower(email) = lower(?)
         AND product_id = ?
         AND used_at IS NULL`
    ).bind(email, productId),
    env.DB.prepare(
      `UPDATE course_admin_grants
       SET revoked_at = CURRENT_TIMESTAMP
       WHERE lower(email) = lower(?)
         AND product_id = ?`
    ).bind(email, productId),
  ]);

  await writeCourseAdminAudit(
    env,
    auth.admin.email,
    "REVOKE_COURSE_ACCESS",
    email,
    productId,
    { reason: reason || null }
  );

  return jsonResponse({ success: true });
}

async function handleAdminRestoreAccess(request, env) {
  const auth = await authorizeAdminRequest(request, env);
  if (auth.response) return auth.response;

  const sameOrigin = validateAdminMutationOrigin(request);
  if (!sameOrigin.ok) return sameOrigin.response;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(
      { success: false, error: "Invalid JSON body" },
      400
    );
  }

  const email = normalizeEmail(payload?.email);
  const productId = adminCourseProductId(env);

  if (!isValidEmail(email)) {
    return jsonResponse(
      { success: false, error: "Valid email is required" },
      400
    );
  }

  const changed = await setCourseEntitlementStatus(
    env,
    email,
    productId,
    "ACTIVE"
  );

  if (!changed) {
    return jsonResponse(
      { success: false, error: "Course entitlement not found" },
      404
    );
  }

  await env.DB.prepare(
    `UPDATE course_admin_grants
     SET revoked_at = NULL
     WHERE lower(email) = lower(?)
       AND product_id = ?`
  )
    .bind(email, productId)
    .run();

  await writeCourseAdminAudit(
    env,
    auth.admin.email,
    "RESTORE_COURSE_ACCESS",
    email,
    productId
  );

  return jsonResponse({ success: true });
}

async function handleAdminRevokeMagicLink(request, env) {
  const auth = await authorizeAdminRequest(request, env);
  if (auth.response) return auth.response;

  const sameOrigin = validateAdminMutationOrigin(request);
  if (!sameOrigin.ok) return sameOrigin.response;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(
      { success: false, error: "Invalid JSON body" },
      400
    );
  }

  const magicLinkId = String(payload?.magic_link_id || "").trim();
  if (!magicLinkId) {
    return jsonResponse(
      { success: false, error: "magic_link_id is required" },
      400
    );
  }

  const link = await env.DB.prepare(
    `SELECT id, email, product_id, used_at, expires_at
     FROM course_magic_links
     WHERE id = ?
     LIMIT 1`
  )
    .bind(magicLinkId)
    .first();

  if (!link) {
    return jsonResponse(
      { success: false, error: "Magic link not found" },
      404
    );
  }

  await env.DB.prepare(
    `UPDATE course_magic_links
     SET used_at = COALESCE(used_at, CURRENT_TIMESTAMP)
     WHERE id = ?`
  )
    .bind(magicLinkId)
    .run();

  await writeCourseAdminAudit(
    env,
    auth.admin.email,
    "REVOKE_MAGIC_LINK",
    link.email,
    link.product_id,
    { magic_link_id: magicLinkId }
  );

  return jsonResponse({ success: true });
}

function validateAdminMutationOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return { ok: true };

  const expectedOrigin = new URL(request.url).origin;
  if (origin !== expectedOrigin) {
    return {
      ok: false,
      response: jsonResponse(
        { success: false, error: "Invalid request origin" },
        403
      ),
    };
  }

  return { ok: true };
}

async function handleAdminApi(request, env, url) {
  const path = url.pathname;

  if (path === ADMIN_ORDERS_API_PATH) {
    if (request.method !== "GET") {
      return methodNotAllowed(["GET"]);
    }
    return getAdminOrders(request, env);
  }

  const getRoutes = new Map([
    [ADMIN_OVERVIEW_API_PATH, getAdminCourseOverview],
    [ADMIN_CUSTOMERS_API_PATH, getAdminCourseCustomers],
    [ADMIN_CUSTOMER_API_PATH, getAdminCourseCustomer],
    [ADMIN_SESSIONS_API_PATH, getAdminCourseSessions],
    [ADMIN_MAGIC_LINKS_API_PATH, getAdminCourseMagicLinks],
    [ADMIN_ACTIVITY_API_PATH, getAdminCourseActivity],
  ]);

  if (getRoutes.has(path)) {
    if (request.method !== "GET") {
      return methodNotAllowed(["GET"]);
    }
    return getRoutes.get(path)(request, env);
  }

  const postRoutes = new Map([
    [ADMIN_GRANT_ACCESS_API_PATH, handleAdminGrantAccess],
    [ADMIN_SEND_MAGIC_LINK_API_PATH, handleAdminSendMagicLink],
    [ADMIN_REVOKE_SESSION_API_PATH, handleAdminRevokeSession],
    [ADMIN_REVOKE_ACCESS_API_PATH, handleAdminRevokeAccess],
    [ADMIN_RESTORE_ACCESS_API_PATH, handleAdminRestoreAccess],
    [ADMIN_REVOKE_MAGIC_LINK_API_PATH, handleAdminRevokeMagicLink],
  ]);

  if (postRoutes.has(path)) {
    if (request.method !== "POST") {
      return methodNotAllowed(["POST"]);
    }
    return postRoutes.get(path)(request, env);
  }

  return jsonResponse(
    { success: false, error: "Admin API endpoint not found" },
    404
  );
}

function methodNotAllowed(allowed) {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: {
      "Allow": allowed.join(", "),
      "Cache-Control": "no-store",
    },
  });
}


function jsonResponse(body, status = 200, extraHeaders = {}) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}


function getSiteOrigin(env) {
  return String(env.SITE_ORIGIN || SITE_ORIGIN_DEFAULT).trim().replace(/\/$/, "");
}

function buildSuccessPageUrl(invoiceNumber, statusToken, env) {
  const origin = getSiteOrigin(env);
  const hash = new URLSearchParams({ invoice: invoiceNumber, token: statusToken }).toString();
  return `${origin}/payment/success/#${hash}`;
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
  return Boolean(value) && value.length <= 128 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeCustomerName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 120);
}

function normalizePhone(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  return digits.slice(0, 16);
}

function normalizeDeviceId(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidDeviceId(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "").trim()
  );
}

function getStoredExpiryDate(payment) {
  const stored = String(payment?.expires_at || "").trim();
  if (stored) {
    const parsed = new Date(stored);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return parseDokuExpiredDate(payment?.expired_date);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatIdr(value) {
  return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
}

function maskEmail(email) {
  const value = String(email || "").trim();
  const at = value.indexOf("@");
  if (at <= 0) return "";
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(2, Math.min(6, local.length - visible.length)))}@${domain}`;
}

function buildWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function buildPurchaseEmailHtml({ order, product, successUrl, whatsappUrl, env }) {
  const greeting = order.customer_name
    ? `Halo ${escapeHtml(order.customer_name)},`
    : "Halo,";

  let nextStepBlock = "";

  if (order.product_id === "digital-marketing-ebooks") {
    // Important: the Google Drive testing URL is deliberately NOT included in email.
    // The buyer must open the token-protected personal purchase page first.
    nextStepBlock = `
      <div style="margin:24px 0;padding:18px;border:1px solid #d8e4f0;border-radius:12px;background:#f4f8fc">
        <p style="margin:0;font-size:15px;line-height:1.7"><strong>Live test Digital Marketing eBooks</strong><br>
        Produk eBook final belum tersedia. Email ini hanya mengarahkan ke halaman pembelian personal untuk melanjutkan simulasi akses pascapembayaran. Simpan link halaman tersebut jika ingin membuka kembali flow testing.</p>
      </div>`;
  } else if (order.product_id === "website-course") {
    const courseAccessUrl = String(env.COURSE_ACCESS_URL || COURSE_ACCESS_URL_DEFAULT).trim();
    nextStepBlock = `
      <div style="margin:24px 0;padding:18px;border:1px solid #d8e4f0;border-radius:12px;background:#f4f8fc">
        <p style="margin:0 0 14px;font-size:15px;line-height:1.7"><strong>Akses course sudah aktif untuk email pembelian ini.</strong><br>
        Klik tombol di bawah, masukkan email yang sama dengan email saat checkout, lalu request magic link. Jika email tidak muncul di inbox utama, cek folder Spam/Junk.</p>
        <p style="margin:0"><a href="${escapeHtml(courseAccessUrl)}" style="display:inline-block;padding:12px 18px;background:#111827;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">Akses Course</a></p>
      </div>`;
  } else {
    nextStepBlock = `
      <p style="font-size:16px;line-height:1.7;margin-top:24px">Jika membutuhkan bantuan atau ingin melanjutkan proses berikutnya, kamu dapat menghubungi Maul melalui WhatsApp.</p>
      <p style="margin:18px 0"><a href="${escapeHtml(whatsappUrl)}" style="display:inline-block;padding:12px 18px;border:1px solid #16a34a;color:#166534;text-decoration:none;border-radius:8px;font-weight:700">Hubungi Maul via WhatsApp</a></p>`;
  }

  return `<!doctype html><html lang="id"><body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
    <div style="max-width:620px;margin:0 auto;padding:32px 18px"><div style="background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:28px">
      <div style="font-size:22px;font-weight:800;margin-bottom:20px">M<span style="color:#ff3158">.</span> Maul Digital</div>
      <h1 style="font-size:24px;line-height:1.25;margin:0 0 18px">Pembayaran berhasil</h1>
      <p style="font-size:16px;line-height:1.7;margin:0 0 16px">${greeting}</p>
      <p style="font-size:16px;line-height:1.7;margin:0 0 22px">Terima kasih sudah membeli <strong>${escapeHtml(order.product_name)}</strong>. Pembayaranmu telah terkonfirmasi.</p>
      <div style="padding:18px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc;margin-bottom:22px">
        <div style="margin-bottom:8px"><strong>Invoice:</strong> ${escapeHtml(order.invoice_number)}</div>
        <div style="margin-bottom:8px"><strong>Produk:</strong> ${escapeHtml(order.product_name)}</div>
        <div><strong>Total:</strong> ${escapeHtml(formatIdr(order.amount))}</div>
      </div>
      <p style="font-size:16px;line-height:1.7">Simpan halaman berikut. Kamu dapat membukanya kembali untuk melihat detail pembelian dan langkah berikutnya:</p>
      <p style="margin:20px 0"><a href="${escapeHtml(successUrl)}" style="display:inline-block;padding:13px 20px;background:#ff3158;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">Buka Halaman Pembelian</a></p>
      ${nextStepBlock}
      <p style="font-size:12px;line-height:1.6;color:#64748b;margin-top:28px">Link halaman pembelian bersifat personal. Simpan dan jangan bagikan link tersebut kepada pihak lain.</p>
    </div></div>
  </body></html>`;
}

async function sendPurchaseSuccessEmail(invoiceNumber, env) {
  const resendApiKey = String(env.RESEND_API_KEY || env.RESEND_KEY || "").trim();
  if (!resendApiKey) {
    console.error("RESEND_API_KEY is missing; payment email was not sent");
    return { sent: false, reason: "missing_api_key" };
  }

  const order = await env.DB.prepare(
    `SELECT invoice_number, product_id, product_name, amount, currency, status,
            status_token, customer_name, customer_email, customer_phone, email_status
     FROM payments WHERE invoice_number = ? LIMIT 1`
  ).bind(invoiceNumber).first();

  if (!order || order.status !== "SUCCESS" || !order.customer_email || !order.status_token) {
    return { sent: false, reason: "order_not_eligible" };
  }
  if (order.email_status === "SENT" || order.email_status === "SENDING") {
    return { sent: false, reason: "already_processed" };
  }

  const claim = await env.DB.prepare(
    `UPDATE payments SET email_status = 'SENDING', updated_at = CURRENT_TIMESTAMP
     WHERE invoice_number = ? AND customer_email IS NOT NULL AND TRIM(customer_email) <> ''
       AND (email_status IS NULL OR email_status IN ('WAITING_PAYMENT','FAILED'))`
  ).bind(invoiceNumber).run();
  if ((claim?.meta?.changes ?? 0) === 0) return { sent: false, reason: "not_claimed" };

  const product = PRODUCT_CATALOG[order.product_id] || {
    name: order.product_name,
    emailSubject: `Pembayaran Berhasil — ${order.product_name}`,
    postPaymentType: "whatsapp",
  };
  const successUrl = buildSuccessPageUrl(order.invoice_number, order.status_token, env);
  const whatsappUrl = buildWhatsAppUrl(
    `Halo Maul, saya sudah menyelesaikan pembayaran untuk ${order.product_name}. Invoice saya ${order.invoice_number}. Saya ingin melanjutkan proses berikutnya.`
  );
  const payload = {
    from: String(env.RESEND_FROM || RESEND_FROM_DEFAULT).trim(),
    to: [order.customer_email],
    subject: product.emailSubject || `Pembayaran Berhasil — ${order.product_name}`,
    html: buildPurchaseEmailHtml({ order, product, successUrl, whatsappUrl, env }),
    tags: [
      { name: "category", value: "payment_success" },
      { name: "product", value: String(order.product_id || "unknown").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 256) },
    ],
  };

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
        "Idempotency-Key": `payment-success/${order.invoice_number}`,
      },
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (!response.ok) {
      const message = data?.message || data?.error?.message || `Resend HTTP ${response.status}`;
      await env.DB.prepare(
        `UPDATE payments SET email_status='FAILED', email_last_error=?, updated_at=CURRENT_TIMESTAMP WHERE invoice_number=?`
      ).bind(String(message).slice(0,500), invoiceNumber).run();
      console.error("Resend payment email failed", { invoiceNumber, status: response.status, data });
      return { sent: false, reason: "resend_error" };
    }
    await env.DB.prepare(
      `UPDATE payments SET email_status='SENT', email_sent_at=CURRENT_TIMESTAMP,
       email_message_id=?, email_last_error=NULL, updated_at=CURRENT_TIMESTAMP WHERE invoice_number=?`
    ).bind(String(data?.id || "").slice(0,200) || null, invoiceNumber).run();
    console.log(JSON.stringify({ type: "PAYMENT_SUCCESS_EMAIL_SENT", invoiceNumber, emailMessageId: data?.id || null }));
    return { sent: true, id: data?.id || null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await env.DB.prepare(
      `UPDATE payments SET email_status='FAILED', email_last_error=?, updated_at=CURRENT_TIMESTAMP WHERE invoice_number=?`
    ).bind(message.slice(0,500), invoiceNumber).run();
    console.error("Resend payment email exception", { invoiceNumber, message });
    return { sent: false, reason: "exception" };
  }
}

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

async function generateDigest(body) {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(body)
  );

  return toBase64(hash);
}

async function generateSignature(secret, component) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const result = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(component)
  );

  return `HMACSHA256=${toBase64(result)}`;
}

async function createPayment(request, env) {
  const clientId = String(env.DOKU_CLIENT_ID || "").trim();
  const secretKey = String(env.DOKU_SECRET_KEY || "").trim();

  if (!env.DB) {
    return jsonResponse(
      { success: false, error: "D1 binding DB is missing" },
      500
    );
  }

  if (!clientId) {
    return jsonResponse(
      { success: false, error: "DOKU_CLIENT_ID missing" },
      500
    );
  }

  if (!secretKey) {
    return jsonResponse(
      { success: false, error: "DOKU_SECRET_KEY missing" },
      500
    );
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return jsonResponse(
      { success: false, error: "Request body must be valid JSON" },
      400
    );
  }

  const productId = String(input?.product_id || "").trim();
  const product = PRODUCT_CATALOG[productId];
  const customerEmail = normalizeEmail(input?.customer_email);
  const customerName = normalizeCustomerName(input?.customer_name);
  const customerPhone = normalizePhone(input?.customer_phone);
  const deviceId = normalizeDeviceId(input?.device_id);

  if (!isValidDeviceId(deviceId)) {
    return jsonResponse(
      { success: false, error: "Device ID tidak valid. Refresh halaman lalu coba lagi." },
      400
    );
  }

  if (!isValidEmail(customerEmail)) {
    return jsonResponse({ success: false, error: "Email wajib diisi dengan format yang valid" }, 400);
  }
  if (customerPhone && (customerPhone.length < 9 || customerPhone.length > 16)) {
    return jsonResponse({ success: false, error: "Nomor telepon tidak valid" }, 400);
  }

  if (!product) {
    return jsonResponse(
      {
        success: false,
        error: "Invalid or unavailable product_id",
      },
      400
    );
  }

  /*
   * ACTIVE ORDER LOCK
   * One browser/device + one product may only have one active PENDING order.
   *
   * First, locally expire old PENDING rows for this device/product.
   * Then reuse an existing unexpired order instead of calling DOKU again.
   */
  const nowIso = new Date().toISOString();

  await env.DB.prepare(
    `UPDATE payments
     SET status = 'EXPIRED',
         updated_at = CURRENT_TIMESTAMP
     WHERE device_id = ?
       AND product_id = ?
       AND status = 'PENDING'
       AND expires_at IS NOT NULL
       AND expires_at <= ?`
  )
    .bind(deviceId, productId, nowIso)
    .run();

  const activeOrder = await env.DB.prepare(
    `SELECT
       invoice_number,
       status_token,
       product_id,
       product_name,
       amount,
       currency,
       payment_url,
       expired_date,
       expires_at,
       customer_email,
       customer_name,
       customer_phone
     FROM payments
     WHERE device_id = ?
       AND product_id = ?
       AND status = 'PENDING'
       AND expires_at IS NOT NULL
       AND expires_at > ?
       AND payment_url IS NOT NULL
       AND TRIM(payment_url) <> ''
     ORDER BY id DESC
     LIMIT 1`
  )
    .bind(deviceId, productId, nowIso)
    .first();

  if (activeOrder) {
    console.log(
      JSON.stringify({
        type: "DOKU_ACTIVE_ORDER_REUSED",
        invoiceNumber: activeOrder.invoice_number,
        productId,
        deviceId,
        expiresAt: activeOrder.expires_at,
      })
    );

    return jsonResponse({
      success: true,
      reused: true,
      active_order: true,
      invoice_number: activeOrder.invoice_number,
      status_token: activeOrder.status_token,
      product_id: activeOrder.product_id,
      product_name: activeOrder.product_name,
      amount: activeOrder.amount,
      currency: activeOrder.currency,
      status: "PENDING",
      payment_url: activeOrder.payment_url,
      expired_date: activeOrder.expired_date,
      expires_at: activeOrder.expires_at,
      success_page_url: buildSuccessPageUrl(
        activeOrder.invoice_number,
        activeOrder.status_token,
        env
      ),
      customer_email_masked: maskEmail(activeOrder.customer_email),
    });
  }

  const invoiceNumber = `INV${Date.now()}`;
  const statusToken = crypto.randomUUID();
  const successPageUrl = buildSuccessPageUrl(invoiceNumber, statusToken, env);

  const payload = {
    order: {
      amount: product.amount,
      invoice_number: invoiceNumber,
      currency: product.currency,
      callback_url_result: successPageUrl,
      auto_redirect: false,
      line_items: [
        {
          name: product.name,
          quantity: 1,
          price: product.amount,
        },
      ],
    },
    payment: {
      payment_due_date: 60,
      ...(Array.isArray(product.paymentMethodTypes) && product.paymentMethodTypes.length
        ? { payment_method_types: product.paymentMethodTypes }
        : {}),
    },
    customer: {
      email: customerEmail,
      ...(customerName ? { name: customerName } : {}),
      ...(customerPhone ? { phone: customerPhone } : {}),
      country: "ID",
    },
  };

  const body = JSON.stringify(payload);
  const requestId = crypto.randomUUID();
  const requestTimestamp = new Date().toISOString().split(".")[0] + "Z";
  const digest = await generateDigest(body);

  const componentSignature =
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${requestTimestamp}\n` +
    `Request-Target:${CREATE_PAYMENT_REQUEST_TARGET}\n` +
    `Digest:${digest}`;

  const signature = await generateSignature(
    secretKey,
    componentSignature
  );

  const dokuEndpoint = getDokuPaymentEndpoint(env);

  const response = await fetch(dokuEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Client-Id": clientId,
      "Request-Id": requestId,
      "Request-Timestamp": requestTimestamp,
      "Signature": signature,
    },
    body,
  });

  const responseText = await response.text();

  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    data = { raw_response: responseText };
  }

  if (!response.ok) {
    return jsonResponse(
      {
        success: false,
        error: "DOKU request failed",
        doku_status: response.status,
        doku_response: data,
      },
      502
    );
  }

  const paymentUrl = String(
    data?.response?.payment?.url || ""
  ).trim();

  const expiredDate = String(
    data?.response?.payment?.expired_date || ""
  ).trim() || null;

  const parsedExpiry = parseDokuExpiredDate(expiredDate);
  const expiresAt = (
    parsedExpiry || new Date(Date.now() + 60 * 60 * 1000)
  ).toISOString();

  if (!paymentUrl) {
    return jsonResponse(
      {
        success: false,
        error: "DOKU response did not include payment URL",
      },
      502
    );
  }

  /*
   * Create PENDING row immediately.
   *
   * This gives D1 a complete order record BEFORE the user pays.
   * DOKU webhook later upgrades this same row to SUCCESS.
   */
  try {
    await env.DB.prepare(
      `INSERT INTO payments (
        invoice_number,
        request_id,
        amount,
        currency,
        status,
        product_id,
        product_name,
        payment_url,
        expired_date,
        status_token,
        customer_name,
        customer_email,
        customer_phone,
        email_status,
        device_id,
        expires_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?, 'WAITING_PAYMENT', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    )
      .bind(
        invoiceNumber,
        requestId,
        product.amount,
        product.currency,
        productId,
        product.name,
        paymentUrl,
        expiredDate,
        statusToken,
        customerName || null,
        customerEmail,
        customerPhone || null,
        deviceId,
        expiresAt
      )
      .run();
  } catch (error) {
    console.error(
      JSON.stringify({
        type: "DOKU_PENDING_SAVE_FAILED",
        invoiceNumber,
        productId,
        error: error instanceof Error ? error.message : String(error),
      })
    );

    return jsonResponse(
      {
        success: false,
        error: "Checkout created but order could not be stored",
      },
      500
    );
  }

  console.log(
    JSON.stringify({
      type: "DOKU_PAYMENT_CREATED",
      dokuEnvironment: getDokuEnvironment(env).name,
      invoiceNumber,
      productId,
      amount: product.amount,
      status: "PENDING",
      deviceId,
      expiresAt,
    })
  );

  return jsonResponse({
    success: true,
    reused: false,
    active_order: true,
    invoice_number: invoiceNumber,
    status_token: statusToken,
    product_id: productId,
    product_name: product.name,
    amount: product.amount,
    currency: product.currency,
    status: "PENDING",
    payment_url: paymentUrl,
    expired_date: expiredDate,
    expires_at: expiresAt,
    success_page_url: successPageUrl,
    customer_email_masked: maskEmail(customerEmail),
  });
}

async function getPaymentStatus(request, env) {
  if (!env.DB) {
    return jsonResponse(
      {
        success: false,
        error: "D1 binding DB is missing",
      },
      500
    );
  }

  const url = new URL(request.url);

  const invoiceNumber = String(
    url.searchParams.get("invoice") || ""
  ).trim();

  const statusToken = String(
    url.searchParams.get("token") || ""
  ).trim();

  if (!invoiceNumber || !statusToken) {
    return jsonResponse(
      {
        success: false,
        error: "invoice and token query parameters are required",
      },
      400
    );
  }

  /*
   * status_token prevents arbitrary invoice-number lookup.
   * The token is generated server-side and only returned to the checkout browser.
   */
  const payment = await env.DB.prepare(
    `SELECT
      invoice_number,
      product_id,
      product_name,
      amount,
      currency,
      status,
      paid_at,
      expired_date,
      expires_at,
      payment_url,
      payment_channel,
      acquirer,
      customer_name,
      customer_email,
      email_status,
      email_sent_at
    FROM payments
    WHERE invoice_number = ?
      AND status_token = ?
    LIMIT 1`
  )
    .bind(invoiceNumber, statusToken)
    .first();

  if (!payment) {
    return jsonResponse(
      {
        success: false,
        found: false,
        error: "Payment not found",
      },
      404
    );
  }

  let effectiveStatus = String(payment.status || "").trim();

  /*
   * DOKU returns expired_date in yyyyMMddHHmmss (UTC+7) specifically so
   * merchants can maintain order expiry on their own side.
   *
   * If our stored order is still PENDING but its checkout due date has passed,
   * we mark the row EXPIRED and return that final state to the frontend.
   */
  if (effectiveStatus === "PENDING") {
    const expiresAt = getStoredExpiryDate(payment);

    if (expiresAt && Date.now() >= expiresAt.getTime()) {
      await env.DB.prepare(
        `UPDATE payments
         SET status = 'EXPIRED',
             updated_at = CURRENT_TIMESTAMP
         WHERE invoice_number = ?
           AND status_token = ?
           AND status = 'PENDING'`
      )
        .bind(invoiceNumber, statusToken)
        .run();

      effectiveStatus = "EXPIRED";

      console.log(
        JSON.stringify({
          type: "DOKU_PAYMENT_EXPIRED_LOCAL",
          invoiceNumber,
          expiredDate: payment.expired_date,
        })
      );
    }
  }

  return jsonResponse({
    success: true,
    found: true,
    invoice_number: payment.invoice_number,
    product_id: payment.product_id,
    product_name: payment.product_name,
    amount: payment.amount,
    currency: payment.currency,
    status: effectiveStatus,
    paid_at: payment.paid_at,
    expired_date: payment.expired_date,
    expires_at: payment.expires_at,
    payment_url: effectiveStatus === "PENDING" ? payment.payment_url : null,
    payment_channel: payment.payment_channel,
    acquirer: payment.acquirer,
    customer_name: payment.customer_name,
    customer_email_masked: maskEmail(payment.customer_email),
    email_status: payment.email_status,
    email_sent_at: payment.email_sent_at,
    resource_url:
      effectiveStatus === "SUCCESS" &&
      payment.product_id === "digital-marketing-ebooks"
        ? (String(env.EBOOK_GDRIVE_URL || "").trim() || null)
        : null,
    success_page_url: buildSuccessPageUrl(payment.invoice_number, statusToken, env),
  });
}

async function saveSuccessfulPayment(notification, requestId, env) {
  if (!env.DB) {
    throw new Error("D1 binding DB is missing");
  }

  const invoiceNumber = String(
    notification?.order?.invoice_number || ""
  ).trim();

  const amount = Number(notification?.order?.amount);

  const currency =
    String(notification?.order?.currency || "").trim() || "IDR";

  const status = String(
    notification?.transaction?.status || ""
  ).trim();

  if (!invoiceNumber) {
    throw new Error("invoice_number is missing from DOKU notification");
  }

  if (!Number.isFinite(amount)) {
    throw new Error("Invalid payment amount from DOKU notification");
  }

  if (status !== "SUCCESS") {
    throw new Error(`Unexpected payment status: ${status || "EMPTY"}`);
  }

  /*
   * Verify the SUCCESS amount against the amount stored when checkout was created.
   * This protects the business logic from accepting a mismatched amount.
   */
  const existing = await env.DB.prepare(
    `SELECT amount, currency, product_id, product_name
     FROM payments
     WHERE invoice_number = ?
     LIMIT 1`
  )
    .bind(invoiceNumber)
    .first();

  if (existing) {
    if (
      Number(existing.amount) !== amount ||
      String(existing.currency || "IDR") !== currency
    ) {
      throw new Error(
        `Payment amount/currency mismatch for ${invoiceNumber}`
      );
    }
  }

  const service = String(notification?.service?.id || "").trim() || null;
  const paymentChannel =
    String(notification?.channel?.id || "").trim() || null;
  const acquirer =
    String(notification?.acquirer?.id || "").trim() || null;
  const virtualAccountNumber =
    String(
      notification?.virtual_account_info?.virtual_account_number || ""
    ).trim() || null;

  const paidAt =
    String(notification?.transaction?.date || "").trim() ||
    new Date().toISOString();

  /*
   * Normally the PENDING row already exists.
   * ON CONFLICT makes webhook retries idempotent.
   * It also keeps product/status-token fields that were stored earlier.
   */
  const result = await env.DB.prepare(
    `INSERT INTO payments (
      invoice_number,
      request_id,
      amount,
      currency,
      status,
      service,
      payment_channel,
      acquirer,
      virtual_account_number,
      paid_at,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(invoice_number) DO UPDATE SET
      request_id = excluded.request_id,
      amount = excluded.amount,
      currency = excluded.currency,
      status = excluded.status,
      service = excluded.service,
      payment_channel = excluded.payment_channel,
      acquirer = excluded.acquirer,
      virtual_account_number = excluded.virtual_account_number,
      paid_at = COALESCE(excluded.paid_at, payments.paid_at),
      updated_at = CURRENT_TIMESTAMP`
  )
    .bind(
      invoiceNumber,
      requestId,
      amount,
      currency,
      status,
      service,
      paymentChannel,
      acquirer,
      virtualAccountNumber,
      paidAt
    )
    .run();

  console.log(
    JSON.stringify({
      type: "DOKU_PAYMENT_SAVED",
      invoiceNumber,
      productId: existing?.product_id || null,
      productName: existing?.product_name || null,
      amount,
      status,
      paymentChannel,
      acquirer,
      paidAt,
      d1Success: Boolean(result?.success),
      rowsWritten: result?.meta?.changes ?? null,
    })
  );

  return result;
}

async function handleDokuNotification(request, env) {
  const clientId = String(request.headers.get("Client-Id") || "").trim();
  const requestId = String(request.headers.get("Request-Id") || "").trim();
  const requestTimestamp = String(
    request.headers.get("Request-Timestamp") || ""
  ).trim();
  const receivedSignature = String(
    request.headers.get("Signature") || ""
  ).trim();

  const expectedClientId = String(env.DOKU_CLIENT_ID || "").trim();
  const secretKey = String(env.DOKU_SECRET_KEY || "").trim();

  if (!expectedClientId || !secretKey) {
    console.error("DOKU webhook runtime credentials are missing");

    return jsonResponse(
      {
        success: false,
        error: "Webhook configuration error",
      },
      500
    );
  }

  if (
    !clientId ||
    !requestId ||
    !requestTimestamp ||
    !receivedSignature
  ) {
    console.error("DOKU webhook missing required headers", {
      hasClientId: Boolean(clientId),
      hasRequestId: Boolean(requestId),
      hasRequestTimestamp: Boolean(requestTimestamp),
      hasSignature: Boolean(receivedSignature),
    });

    return jsonResponse(
      {
        success: false,
        error: "Missing DOKU notification headers",
      },
      400
    );
  }

  if (clientId !== expectedClientId) {
    console.error("DOKU webhook Client-Id mismatch", {
      receivedClientId: clientId,
    });

    return jsonResponse(
      {
        success: false,
        error: "Invalid Client-Id",
      },
      401
    );
  }

  const rawBody = await request.text();
  const digest = await generateDigest(rawBody);

  const componentSignature =
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${requestTimestamp}\n` +
    `Request-Target:${DOKU_NOTIFICATION_PATH}\n` +
    `Digest:${digest}`;

  const expectedSignature = await generateSignature(
    secretKey,
    componentSignature
  );

  const signatureValid = receivedSignature === expectedSignature;

  let notification;
  try {
    notification = JSON.parse(rawBody);
  } catch {
    console.error("DOKU webhook body is not valid JSON");

    return jsonResponse(
      {
        success: false,
        error: "Invalid JSON body",
      },
      400
    );
  }

  console.log(
    JSON.stringify({
      type: "DOKU_NOTIFICATION",
      signatureValid,
      requestId,
      transactionStatus: notification?.transaction?.status || null,
      invoiceNumber: notification?.order?.invoice_number || null,
      amount: notification?.order?.amount || null,
      service: notification?.service?.id || null,
      acquirer: notification?.acquirer?.id || null,
      channel: notification?.channel?.id || null,
      virtualAccountNumber:
        notification?.virtual_account_info?.virtual_account_number || null,
      transactionDate: notification?.transaction?.date || null,
    })
  );

  if (!signatureValid) {
    console.error("DOKU webhook signature validation failed");

    return jsonResponse(
      {
        success: false,
        error: "Invalid notification signature",
      },
      401
    );
  }

  if (notification?.transaction?.status !== "SUCCESS") {
    console.log(
      JSON.stringify({
        type: "DOKU_NOTIFICATION_IGNORED",
        reason: "status_not_success",
        transactionStatus: notification?.transaction?.status || null,
        invoiceNumber: notification?.order?.invoice_number || null,
      })
    );

    return jsonResponse({
      success: true,
      message: "Notification received but not persisted as SUCCESS",
    });
  }

  try {
    await saveSuccessfulPayment(notification, requestId, env);
  } catch (error) {
    console.error(
      JSON.stringify({
        type: "DOKU_PAYMENT_SAVE_FAILED",
        invoiceNumber: notification?.order?.invoice_number || null,
        error: error instanceof Error ? error.message : String(error),
      })
    );

    return jsonResponse(
      {
        success: false,
        error: "Failed to persist payment",
      },
      500
    );
  }

  const successfulInvoice = String(notification?.order?.invoice_number || "").trim();
  try {
    await sendPurchaseSuccessEmail(successfulInvoice, env);
  } catch (error) {
    console.error("Post-payment email processing failed", {
      invoiceNumber: successfulInvoice,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  console.log(
    JSON.stringify({
      type: "DOKU_PAYMENT_SUCCESS",
      invoiceNumber: successfulInvoice || null,
      amount: notification?.order?.amount || null,
      requestId,
    })
  );

  return jsonResponse({
    success: true,
    message: "DOKU notification received and payment saved",
  });
}


const SITE_THEME_SCRIPT_TAG =
  '<script src="/assets/site-theme.js" data-maul-site-theme-runtime defer></script>';

function isThemeManagedStaticPath(pathname) {
  /*
   * Keep the legacy portfolio pages in their original dark-only theme.
   * Do NOT inject /assets/site-theme.js into Home, Frameworks, Blog,
   * or Framework detail pages.
   *
   * Products keeps its own native Light/Dark implementation and is
   * intentionally untouched here.
   *
   * Profile keeps the current runtime theme behavior because it was not
   * included in this rollback request.
   */
  return (
    pathname === "/profile" ||
    pathname.startsWith("/profile/")
  );
}

async function serveStaticAsset(request, env) {
  const response = await env.ASSETS.fetch(request);

  if (
    request.method !== "GET" ||
    !response.ok ||
    !isThemeManagedStaticPath(new URL(request.url).pathname) ||
    !String(response.headers.get("content-type") || "").toLowerCase().includes("text/html")
  ) {
    return response;
  }

  const html = await response.text();

  if (html.includes("data-maul-site-theme-runtime")) {
    return new Response(html, response);
  }

  const injected = html.includes("</body>")
    ? html.replace("</body>", `${SITE_THEME_SCRIPT_TAG}\n</body>`)
    : `${html}\n${SITE_THEME_SCRIPT_TAG}`;

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");

  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/admin/api/")) {
      return handleAdminApi(request, env, url);
    }

    if (url.pathname === DOKU_SDK_PATH) {
      if (request.method !== "GET") {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: {
            "Allow": "GET",
          },
        });
      }

      try {
        return serveDokuCheckoutSdk(env);
      } catch (error) {
        console.error("DOKU environment configuration error", error);

        return jsonResponse(
          {
            success: false,
            error: "DOKU environment configuration error",
          },
          500
        );
      }
    }

    if (url.pathname === PAYMENT_STATUS_PATH) {
      if (request.method !== "GET") {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: {
            "Allow": "GET",
          },
        });
      }

      return getPaymentStatus(request, env);
    }

    if (url.pathname === DOKU_NOTIFICATION_PATH) {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: {
            "Allow": "POST",
          },
        });
      }

      return handleDokuNotification(request, env);
    }

    if (url.pathname === "/api/create-payment") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: {
            "Allow": "POST",
          },
        });
      }

      return createPayment(request, env);
    }

    return serveStaticAsset(request, env);
  },
};
