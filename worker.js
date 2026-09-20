const CREATE_PAYMENT_REQUEST_TARGET = "/checkout/v1/payment";
const DOKU_NOTIFICATION_PATH = "/api/doku-notification";
const PAYMENT_STATUS_PATH = "/api/payment-status";
const DOKU_SDK_PATH = "/api/doku-checkout-sdk.js";
const SITE_ORIGIN_DEFAULT = "https://digmarketingmaul.my.id";
const RESEND_ENDPOINT = "https://api.resend.com/emails";
const RESEND_FROM_DEFAULT = "Maul Digital <order@mail.digmarketingmaul.my.id>";
const WHATSAPP_NUMBER = "6281296069566";
const encoder = new TextEncoder();

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
const PRODUCT_CATALOG = Object.freeze({
  "website-development": {
    name: "Website Development",
    amount: 999000,
    currency: "IDR",
    emailSubject: "Pembayaran Berhasil — Website Development",
    resourceUrl: null,
    resourceLabel: null,
  },
  "website-building-advisory": {
    name: "Website Building Advisory 1 on 1",
    amount: 1200000,
    currency: "IDR",
  },
  "meta-ads-advisory": {
    name: "Meta Ads Advisory 1 on 1",
    amount: 1200000,
    currency: "IDR",
  },
  "google-ads-advisory": {
    name: "Google Ads Advisory 1 on 1",
    amount: 1200000,
    currency: "IDR",
  },
});

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

function buildPurchaseEmailHtml({ order, product, successUrl, whatsappUrl }) {
  const greeting = order.customer_name ? `Halo ${escapeHtml(order.customer_name)},` : "Halo,";
  const resourceBlock = product?.resourceUrl
    ? `<div style="margin:24px 0;padding:18px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc">
         <p style="margin:0 0 12px;font-weight:700">Akses produk / materi</p>
         <a href="${escapeHtml(product.resourceUrl)}" style="display:inline-block;padding:12px 18px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">${escapeHtml(product.resourceLabel || "Buka Produk")}</a>
       </div>`
    : "";

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
      ${resourceBlock}
      <p style="font-size:16px;line-height:1.7;margin-top:24px">Untuk melanjutkan proses Website Development atau jika membutuhkan bantuan, kamu juga dapat menghubungi Maul melalui WhatsApp.</p>
      <p style="margin:18px 0"><a href="${escapeHtml(whatsappUrl)}" style="display:inline-block;padding:12px 18px;border:1px solid #16a34a;color:#166534;text-decoration:none;border-radius:8px;font-weight:700">Hubungi Maul via WhatsApp</a></p>
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
    resourceUrl: null,
    resourceLabel: null,
  };
  const successUrl = buildSuccessPageUrl(order.invoice_number, order.status_token, env);
  const whatsappUrl = buildWhatsAppUrl(
    `Halo Maul, saya sudah menyelesaikan pembayaran untuk ${order.product_name}. Invoice saya ${order.invoice_number}. Saya ingin melanjutkan proses berikutnya.`
  );
  const payload = {
    from: String(env.RESEND_FROM || RESEND_FROM_DEFAULT).trim(),
    to: [order.customer_email],
    subject: product.emailSubject || `Pembayaran Berhasil — ${order.product_name}`,
    html: buildPurchaseEmailHtml({ order, product, successUrl, whatsappUrl }),
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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

    return env.ASSETS.fetch(request);
  },
};
