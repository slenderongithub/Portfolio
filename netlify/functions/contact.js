const crypto = require("crypto");

const RATE_LIMIT_WINDOW_MS = 30_000;
const RATE_LIMIT_MAX = 4;
const rateLimitStore = new Map();
const DEFAULT_FALLBACK_FORM_URL = "https://formsubmit.co/slenderisprogramming@gmail.com";
const FALLBACK_FORM_URL = Object.prototype.hasOwnProperty.call(process.env, "CONTACT_FALLBACK_URL")
  ? process.env.CONTACT_FALLBACK_URL
  : DEFAULT_FALLBACK_FORM_URL;

function getHeader(headers, name) {
  if (!headers) return "";
  const target = name.toLowerCase();
  const key = Object.keys(headers).find((header) => header.toLowerCase() === target);
  return key ? headers[key] : "";
}

function getClientIp(event) {
  const headers = event.headers || {};
  const forwarded = getHeader(headers, "x-forwarded-for");
  const netlifyIp = getHeader(headers, "x-nf-client-connection-ip");
  const candidate = netlifyIp || forwarded || "";
  return candidate.split(",")[0].trim();
}

function normalizeString(value, maxLen) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

function decodeBody(event) {
  if (!event || !event.body) return "";
  if (event.isBase64Encoded) {
    return Buffer.from(event.body, "base64").toString("utf8");
  }
  return event.body;
}

function parseBody(event) {
  const body = decodeBody(event);
  if (!body) return {};

  const contentType = getHeader(event.headers, "content-type").split(";")[0].trim();

  if (contentType === "application/json") {
    try {
      return JSON.parse(body);
    } catch (error) {
      return {};
    }
  }

  if (contentType === "application/x-www-form-urlencoded") {
    return Object.fromEntries(new URLSearchParams(body));
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    return Object.fromEntries(new URLSearchParams(body));
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isRateLimited(ip) {
  if (!ip) return false;

  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  rateLimitStore.set(ip, entry);

  return entry.count > RATE_LIMIT_MAX;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getRedirectTarget(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (!trimmed.startsWith("/")) return "";
  return trimmed;
}

async function sendResendEmail({ apiKey, to, from, replyTo, subject, html }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Resend error:", response.status, errorBody);
    return false;
  }

  return true;
}

async function forwardToFormSubmit({ url, data }) {
  const formBody = new URLSearchParams();
  formBody.set("name", data.name);
  formBody.set("email", data.email);
  formBody.set("subject", data.subject);
  formBody.set("message", data.message);
  formBody.set("intent", data.intent);
  formBody.set("_subject", data.mailSubject || data.subject);
  formBody.set("_template", "table");
  formBody.set("_captcha", "false");

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: formBody.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("FormSubmit error:", response.status, errorBody);
    return false;
  }

  return true;
}

exports.handler = async (event) => {
  const headers = event.headers || {};
  const baseHeaders = {
    "access-control-allow-origin": getHeader(headers, "origin") || "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: baseHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...baseHeaders, "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, error: "Method not allowed." }),
    };
  }

  const data = parseBody(event);
  const honey = normalizeString(data.honey || data._honey || "", 100);
  if (honey) {
    return {
      statusCode: 200,
      headers: { ...baseHeaders, "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: true, ignored: true }),
    };
  }

  const name = normalizeString(data.name, 120);
  const email = normalizeString(data.email, 200);
  const subject = normalizeString(data.subject || data._subject || "", 160);
  const intent = normalizeString(data.intent || "Contact", 120);
  const message = normalizeString(data.message, 4000);

  if (!name || !email || !subject || !message) {
    return {
      statusCode: 400,
      headers: { ...baseHeaders, "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, error: "Missing required fields." }),
    };
  }

  if (!isValidEmail(email)) {
    return {
      statusCode: 400,
      headers: { ...baseHeaders, "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, error: "Invalid email address." }),
    };
  }

  const ip = getClientIp(event);
  if (isRateLimited(ip)) {
    return {
      statusCode: 429,
      headers: { ...baseHeaders, "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, error: "Too many requests. Please try again soon." }),
    };
  }

  const submissionId = crypto.randomUUID();
  const receivedAt = new Date().toISOString();

  const summaryText = `Name: ${name}\nEmail: ${email}\nIntent: ${intent}\nSubject: ${subject}\n\n${message}`;
  const htmlMessage = `
    <h2>New portfolio message</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Intent:</strong> ${escapeHtml(intent)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Received:</strong> ${escapeHtml(receivedAt)}</p>
    <hr />
    <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
  `;

  let delivered = false;
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || "portfolio@resend.dev";

  if (apiKey && to) {
    delivered = await sendResendEmail({
      apiKey,
      to,
      from,
      replyTo: email,
      subject: `[Portfolio: ${intent}] ${subject}`,
      html: htmlMessage,
    });
  }

  if (!delivered && FALLBACK_FORM_URL) {
    delivered = await forwardToFormSubmit({
      url: FALLBACK_FORM_URL,
      data: {
        name,
        email,
        subject,
        message,
        intent,
        mailSubject: `[Portfolio: ${intent}] ${subject}`,
      },
    });
  }

  if (!delivered) {
    console.log("Portfolio contact submission:", { submissionId, receivedAt, name, email, intent, subject });
    console.log(summaryText);
  }

  const wantsHtml = getHeader(headers, "accept").includes("text/html");
  const redirectTarget = getRedirectTarget(data.redirect || "");
  if (wantsHtml && redirectTarget) {
    return {
      statusCode: 303,
      headers: { ...baseHeaders, Location: redirectTarget },
      body: "",
    };
  }

  return {
    statusCode: 200,
    headers: { ...baseHeaders, "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ ok: true, delivered, id: submissionId }),
  };
};
