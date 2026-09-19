const CREATE_PAYMENT_REQUEST_TARGET = "/checkout/v1/payment";
const DOKU_NOTIFICATION_PATH = "/api/doku-notification";
const PAYMENT_STATUS_PATH = "/api/payment-status";
const DOKU_SDK_PATH = "/api/doku-checkout-sdk.js";
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
    amount: 1500000,
    currency: "IDR",
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

  if (!product) {
    return jsonResponse(
      {
        success: false,
        error: "Invalid or unavailable product_id",
      },
      400
    );
  }

  const invoiceNumber = `INV${Date.now()}`;
  const statusToken = crypto.randomUUID();

  const payload = {
    order: {
      amount: product.amount,
      invoice_number: invoiceNumber,
      currency: product.currency,
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
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
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
        statusToken
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
    })
  );

  return jsonResponse({
    success: true,
    invoice_number: invoiceNumber,
    status_token: statusToken,
    product_id: productId,
    product_name: product.name,
    amount: product.amount,
    currency: product.currency,
    status: "PENDING",
    payment_url: paymentUrl,
    expired_date: expiredDate,
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
      expired_date
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
    const expiresAt = parseDokuExpiredDate(payment.expired_date);

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

  console.log(
    JSON.stringify({
      type: "DOKU_PAYMENT_SUCCESS",
      invoiceNumber: notification?.order?.invoice_number || null,
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
