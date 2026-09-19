const DOKU_ENDPOINT =
  "https://api-sandbox.doku.com/checkout/v1/payment";

const REQUEST_TARGET = "/checkout/v1/payment";

const encoder = new TextEncoder();

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

async function sha256Base64(text) {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(text)
  );

  return arrayBufferToBase64(hash);
}

async function hmacSha256Base64(secret, text) {
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

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(text)
  );

  return arrayBufferToBase64(signature);
}

async function createPayment(env) {
  // Sandbox test product: Rp20.000
  const invoiceNumber = `INV${Date.now()}`;

  const payload = {
    order: {
      amount: 20000,
      invoice_number: invoiceNumber,
    },
    payment: {
      payment_due_date: 60,
    },
  };

  const body = JSON.stringify(payload);

  const requestId = crypto.randomUUID();

  // UTC / ISO8601, without milliseconds
  const requestTimestamp = new Date()
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z");

  const digest = await sha256Base64(body);

  const signatureComponent = [
    `Client-Id:${env.DOKU_CLIENT_ID}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${requestTimestamp}`,
    `Request-Target:${REQUEST_TARGET}`,
    `Digest:${digest}`,
  ].join("\n");

  const signatureHash = await hmacSha256Base64(
    env.DOKU_SECRET_KEY,
    signatureComponent
  );

  const signature = `HMACSHA256=${signatureHash}`;

  const dokuResponse = await fetch(DOKU_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Client-Id": env.DOKU_CLIENT_ID,
      "Request-Id": requestId,
      "Request-Timestamp": requestTimestamp,
      Signature: signature,
    },
    body,
  });

  const responseText = await dokuResponse.text();

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    data = {
      raw_response: responseText,
    };
  }

  if (!dokuResponse.ok) {
    return Response.json(
      {
        success: false,
        error: "DOKU request failed",
        doku_status: dokuResponse.status,
        doku_response: data,
      },
      {
        status: 502,
      }
    );
  }

  return Response.json({
    success: true,
    invoice_number: invoiceNumber,
    payment_url: data?.response?.payment?.url,
    expired_date: data?.response?.payment?.expired_date,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/create-payment") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: {
            Allow: "POST",
          },
        });
      }

      return createPayment(env);
    }

    // Semua request website lainnya tetap dilayani
    // dari static assets seperti sebelumnya.
    return env.ASSETS.fetch(request);
  },
};
