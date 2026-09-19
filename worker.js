const DOKU_ENDPOINT =
  "https://api-sandbox.doku.com/checkout/v1/payment";

const REQUEST_TARGET = "/checkout/v1/payment";

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
      amount: 20000,
      invoice_number: invoiceNumber,
    },
    payment: {
      payment_due_date: 60,
    },
  };

  // Body yang di-hash HARUS sama persis
  // dengan body yang dikirim ke DOKU.
  const body = JSON.stringify(payload);

  const requestId = crypto.randomUUID();

  const requestTimestamp =
    new Date().toISOString().split(".")[0] + "Z";

  const digest = await generateDigest(body);

  const componentSignature =
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${requestTimestamp}\n` +
    `Request-Target:${REQUEST_TARGET}\n` +
    `Digest:${digest}`;

  const signature = await generateSignature(
    secretKey,
    componentSignature
  );

  // Aman untuk debugging:
  // TIDAK mencetak Secret Key.
  console.log(
    JSON.stringify({
      clientId,
      requestId,
      requestTimestamp,
      requestTarget: REQUEST_TARGET,
      digest,
      secretLength: secretKey.length,
      body,
    })
  );

  const response = await fetch(DOKU_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Client-Id": clientId,
      "Request-Id": requestId,
      "Request-Timestamp": requestTimestamp,
      Signature: signature,
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

    return env.ASSETS.fetch(request);
  },
};
