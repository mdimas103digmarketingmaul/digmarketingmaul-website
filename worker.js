const DOKU_ENDPOINT = "https://api-sandbox.doku.com/checkout/v1/payment";
const CREATE_PAYMENT_REQUEST_TARGET = "/checkout/v1/payment";
const DOKU_NOTIFICATION_PATH = "/api/doku-notification";
const PAYMENT_STATUS_PATH = "/api/payment-status";
const encoder = new TextEncoder();

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

async function createPayment(env) {
  const clientId = String(env.DOKU_CLIENT_ID || "").trim();
  const secretKey = String(env.DOKU_SECRET_KEY || "").trim();

  if (!clientId) {
    return Response.json(
      { success: false, error: "DOKU_CLIENT_ID missing" },
      { status: 500 }
    );
  }

  if (!secretKey) {
    return Response.json(
      { success: false, error: "DOKU_SECRET_KEY missing" },
      { status: 500 }
    );
  }

  const invoiceNumber = `INV${Date.now()}`;

  const payload = {
    order: {
      amount: 100000,
      invoice_number: invoiceNumber,
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

  const response = await fetch(DOKU_ENDPOINT, {
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
    return Response.json(
      {
        success: false,
        error: "DOKU request failed",
        doku_status: response.status,
        doku_response: data,
      },
      { status: 502 }
    );
  }

  return Response.json({
    success: true,
    invoice_number: invoiceNumber,
    payment_url: data?.response?.payment?.url,
    expired_date: data?.response?.payment?.expired_date,
  });
}

async function getPaymentStatus(request, env) {
  if (!env.DB) {
    return Response.json(
      {
        success: false,
        error: "D1 binding DB is missing",
      },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const invoiceNumber = String(
    url.searchParams.get("invoice") || ""
  ).trim();

  if (!invoiceNumber) {
    return Response.json(
      {
        success: false,
        error: "invoice query parameter is required",
      },
      { status: 400 }
    );
  }

  const payment = await env.DB.prepare(
    `SELECT
      invoice_number,
      amount,
      currency,
      status,
      paid_at
    FROM payments
    WHERE invoice_number = ?
    LIMIT 1`
  )
    .bind(invoiceNumber)
    .first();

  if (!payment) {
    /*
     * D1 saat ini hanya menyimpan pembayaran yang sudah SUCCESS.
     * Jadi "belum ditemukan di D1" bukan error: untuk frontend artinya
     * transaksi masih menunggu konfirmasi pembayaran.
     */
    return Response.json(
      {
        success: true,
        found: false,
        invoice_number: invoiceNumber,
        status: "PENDING",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  return Response.json(
    {
      success: true,
      found: true,
      invoice_number: payment.invoice_number,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paid_at: payment.paid_at,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

async function saveSuccessfulPayment(notification, requestId, env) {
  if (!env.DB) {
    throw new Error("D1 binding DB is missing");
  }

  const invoiceNumber = String(
    notification?.order?.invoice_number || ""
  ).trim();

  const amount = Number(notification?.order?.amount);
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

  const currency = "IDR";
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

    return Response.json(
      {
        success: false,
        error: "Webhook configuration error",
      },
      { status: 500 }
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

    return Response.json(
      {
        success: false,
        error: "Missing DOKU notification headers",
      },
      { status: 400 }
    );
  }

  if (clientId !== expectedClientId) {
    console.error("DOKU webhook Client-Id mismatch", {
      receivedClientId: clientId,
    });

    return Response.json(
      {
        success: false,
        error: "Invalid Client-Id",
      },
      { status: 401 }
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

    return Response.json(
      {
        success: false,
        error: "Invalid JSON body",
      },
      { status: 400 }
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

    return Response.json(
      {
        success: false,
        error: "Invalid notification signature",
      },
      { status: 401 }
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

    return Response.json(
      {
        success: true,
        message: "Notification received but not persisted",
      },
      { status: 200 }
    );
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

    return Response.json(
      {
        success: false,
        error: "Failed to persist payment",
      },
      { status: 500 }
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

  return Response.json(
    {
      success: true,
      message: "DOKU notification received and payment saved",
    },
    { status: 200 }
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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

      return createPayment(env);
    }

    return env.ASSETS.fetch(request);
  },
};
