const crypto = require("crypto");

const RATE_WINDOW_MS = 30000;
const RATE_MAX = 4;
const MAX_BODY_BYTES = 10240;
const ALLOWED_ORIGINS = [
  "https://shubhadeepdatta.netlify.app",
  "https://shubhadeepdatta.com",
  "http://localhost:8888",
  "http://localhost:3000"
];
const rateLimitStore = new Map();
const DEFAULT_FALLBACK_URL = "https://formsubmit.co/slenderisprogramming@gmail.com";
const FALLBACK_URL = Object.prototype.hasOwnProperty.call(process.env, "CONTACT_FALLBACK_URL")
  ? process.env.CONTACT_FALLBACK_URL
  : DEFAULT_FALLBACK_URL;

function getHeader(headers, name) {
  if (!headers) return "";
  var target = name.toLowerCase();
  var key = Object.keys(headers).find(function (h) { return h.toLowerCase() === target; });
  return key ? headers[key] : "";
}

function getClientIp(event) {
  var headers = event.headers || {};
  var candidate = getHeader(headers, "x-nf-client-connection-ip") || getHeader(headers, "x-forwarded-for") || "";
  return candidate.split(",")[0].trim();
}

function normalizeString(value, maxLen) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

function decodeBody(event) {
  if (!event || !event.body) return "";
  if (event.isBase64Encoded) return Buffer.from(event.body, "base64").toString("utf8");
  return event.body;
}

function parseBody(event) {
  var body = decodeBody(event);
  if (!body) return {};
  var ct = getHeader(event.headers, "content-type").split(";")[0].trim();
  if (ct === "application/json") {
    try { return JSON.parse(body); } catch (_) { return {}; }
  }
  if (ct === "application/x-www-form-urlencoded") {
    return Object.fromEntries(new URLSearchParams(body));
  }
  try { return JSON.parse(body); } catch (_) {
    return Object.fromEntries(new URLSearchParams(body));
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function pruneExpired() {
  var now = Date.now();
  rateLimitStore.forEach(function (entry, ip) {
    if (entry.resetAt <= now) rateLimitStore.delete(ip);
  });
}

function isRateLimited(ip) {
  if (!ip) return false;
  pruneExpired();
  var now = Date.now();
  var entry = rateLimitStore.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getRedirectTarget(value) {
  if (typeof value !== "string") return "";
  var trimmed = value.trim();
  if (!trimmed || !trimmed.startsWith("/")) return "";
  return trimmed;
}

function isOriginAllowed(origin) {
  if (!origin) return true;
  return ALLOWED_ORIGINS.some(function (allowed) { return origin === allowed; });
}

async function sendResendEmail(opts) {
  var response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "content-type": "application/json", "authorization": "Bearer " + opts.apiKey },
    body: JSON.stringify({ from: opts.from, to: [opts.to], reply_to: opts.replyTo, subject: opts.subject, html: opts.html })
  });
  if (!response.ok) {
    console.error("Resend error:", response.status, await response.text());
    return false;
  }
  return true;
}

async function forwardToFormSubmit(opts) {
  var formBody = new URLSearchParams();
  formBody.set("name", opts.data.name);
  formBody.set("email", opts.data.email);
  formBody.set("subject", opts.data.subject);
  formBody.set("message", opts.data.message);
  formBody.set("intent", opts.data.intent);
  formBody.set("_subject", opts.data.mailSubject || opts.data.subject);
  formBody.set("_template", "table");
  formBody.set("_captcha", "false");
  var response = await fetch(opts.url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: formBody.toString()
  });
  if (!response.ok) {
    console.error("FormSubmit error:", response.status, await response.text());
    return false;
  }
  return true;
}

exports.handler = async function (event) {
  var headers = event.headers || {};
  var origin = getHeader(headers, "origin");
  var baseHeaders = {
    "access-control-allow-origin": origin || "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: baseHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { ...baseHeaders, "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ ok: false, error: "Method not allowed." }) };
  }
  if (!isOriginAllowed(origin)) {
    return { statusCode: 403, headers: { ...baseHeaders, "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ ok: false, error: "Origin not allowed." }) };
  }
  var rawBody = event.body || "";
  if (Buffer.byteLength(rawBody, event.isBase64Encoded ? "base64" : "utf8") > MAX_BODY_BYTES) {
    return { statusCode: 413, headers: { ...baseHeaders, "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ ok: false, error: "Payload too large." }) };
  }

  var data = parseBody(event);
  var honey = normalizeString(data.honey || data._honey || "", 100);
  if (honey) {
    return { statusCode: 200, headers: { ...baseHeaders, "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ ok: true, ignored: true }) };
  }

  var name = normalizeString(data.name, 120);
  var email = normalizeString(data.email, 200);
  var subject = normalizeString(data.subject || data._subject || "", 160);
  var intent = normalizeString(data.intent || "Contact", 120);
  var message = normalizeString(data.message, 4000);

  if (!name || !email || !subject || !message) {
    return { statusCode: 400, headers: { ...baseHeaders, "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ ok: false, error: "Missing required fields." }) };
  }
  if (!isValidEmail(email)) {
    return { statusCode: 400, headers: { ...baseHeaders, "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ ok: false, error: "Invalid email address." }) };
  }

  var ip = getClientIp(event);
  if (isRateLimited(ip)) {
    return { statusCode: 429, headers: { ...baseHeaders, "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ ok: false, error: "Too many requests. Please try again soon." }) };
  }

  var submissionId = crypto.randomUUID();
  var receivedAt = new Date().toISOString();
  var htmlMessage = "<h2>New portfolio message</h2>"
    + "<p><strong>Name:</strong> " + escapeHtml(name) + "</p>"
    + "<p><strong>Email:</strong> " + escapeHtml(email) + "</p>"
    + "<p><strong>Intent:</strong> " + escapeHtml(intent) + "</p>"
    + "<p><strong>Subject:</strong> " + escapeHtml(subject) + "</p>"
    + "<p><strong>Received:</strong> " + escapeHtml(receivedAt) + "</p>"
    + "<hr />"
    + "<p>" + escapeHtml(message).replace(/\n/g, "<br />") + "</p>";

  var delivered = false;
  var apiKey = process.env.RESEND_API_KEY;
  var to = process.env.CONTACT_TO_EMAIL;
  var from = process.env.CONTACT_FROM_EMAIL || "portfolio@resend.dev";
  var emailSubject = "[Portfolio: " + intent + "] " + subject;

  if (apiKey && to) {
    delivered = await sendResendEmail({ apiKey: apiKey, to: to, from: from, replyTo: email, subject: emailSubject, html: htmlMessage });
  }
  if (!delivered && FALLBACK_URL) {
    delivered = await forwardToFormSubmit({ url: FALLBACK_URL, data: { name: name, email: email, subject: subject, message: message, intent: intent, mailSubject: emailSubject } });
  }
  if (!delivered) {
    console.log("Portfolio contact submission:", { submissionId: submissionId, receivedAt: receivedAt, name: name, email: email, intent: intent, subject: subject });
    console.log("Name: " + name + "\nEmail: " + email + "\nIntent: " + intent + "\nSubject: " + subject + "\n\n" + message);
  }

  var wantsHtml = getHeader(headers, "accept").includes("text/html");
  var redirectTarget = getRedirectTarget(data.redirect || "");
  if (wantsHtml && redirectTarget) {
    return { statusCode: 303, headers: { ...baseHeaders, Location: redirectTarget }, body: "" };
  }
  return { statusCode: 200, headers: { ...baseHeaders, "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ ok: true, delivered: delivered, id: submissionId }) };
};
