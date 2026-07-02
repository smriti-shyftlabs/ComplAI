/**
 * mailer.js — vendor email notifications on approve/reject.
 *
 * Sends to the product's vendor (product.vendorEmail), falling back to
 * NOTIFY_EMAIL. Includes the compliance report — score/risk summary, and on
 * rejection the missing/improper items with required fixes.
 *
 * Real SMTP when configured (SMTP_* in .env); otherwise Ethereal — a free test
 * SMTP that captures mail and returns a clickable preview URL (nothing is
 * actually delivered). Every attempt is recorded (GET /api/emails).
 */

import nodemailer from 'nodemailer';
import { Emails } from './seed.js';
import { generateId } from './utils.js';

const {
  SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS,
  MAIL_FROM, NOTIFY_EMAIL,
} = process.env;

const smtpConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
export const mailMode = smtpConfigured ? 'smtp' : 'ethereal';
export const mailEnabled = true;

let realTransport = smtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: String(SMTP_SECURE) === 'true' || Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

let etherealPromise = null;
async function getTransport() {
  if (realTransport) return realTransport;
  if (!etherealPromise) {
    etherealPromise = (async () => {
      const acct = await nodemailer.createTestAccount();
      console.log(`[mail] Ethereal test inbox ready — login ${acct.user} at https://ethereal.email`);
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email', port: 587, secure: false,
        auth: { user: acct.user, pass: acct.pass },
      });
    })().catch((err) => { etherealPromise = null; throw err; });
  }
  return etherealPromise;
}

const SEV_COLOR = { critical: '#dc2626', high: '#ea580c', medium: '#ca8a04', low: '#2563eb' };

function messageFor(product, decision, report) {
  if (decision === 'Approved') {
    return `Great news — “${product.name}” has passed ComplAI's automated compliance review and is approved for publication. A summary of the review is below.`;
  }
  return `After review, “${product.name}” did not meet the compliance requirements for publication and has been rejected. Please resolve the issues listed below and resubmit. ${report?.recommendation || ''}`.trim();
}

function buildText(product, decision, comment, report) {
  const L = [];
  L.push(`COMPLIANCE REPORT — ${decision.toUpperCase()}`, '');
  L.push(`Product:  ${product.name} (${product.id})`);
  L.push(`Category: ${product.category} · Brand: ${product.brand || 'n/a'}`);
  if (product.country) L.push(`Market:   ${product.country}`);
  L.push('', messageFor(product, decision, report));
  if (report) {
    L.push('', `Compliance score: ${report.score}/100  (${report.riskLevel} risk)`);
    L.push(`Rules checked: ${report.rulesChecked}   passed: ${report.rulesPassed}   failed: ${report.rulesFailed}`);
    if (report.confidence) L.push(`AI confidence: ${report.confidence}%`);
  }
  if (comment) L.push('', `Reviewer note: ${comment}`);
  const violations = report?.violations || [];
  if (decision === 'Rejected' && violations.length) {
    L.push('', 'ISSUES TO RESOLVE (missing / improper):');
    violations.forEach((v, i) =>
      L.push(`  ${i + 1}. [${(v.severity || 'medium').toUpperCase()}] ${v.rule}\n     Issue: ${v.description}\n     Fix:   ${v.fix}`));
  }
  L.push('', '— ComplAI Compliance Team');
  return L.join('\n');
}

function buildHtml(product, decision, comment, report) {
  const approved = decision === 'Approved';
  const accent = approved ? '#16a34a' : '#dc2626';
  const violations = report?.violations || [];
  const issues = (decision === 'Rejected' && violations.length) ? `
    <h3 style="margin:24px 0 8px;font-size:15px;color:#111827;">Issues to resolve (${violations.length})</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      ${violations.map(v => `<tr><td style="padding:10px 12px;border:1px solid #eee;vertical-align:top;">
        <span style="display:inline-block;font-size:11px;font-weight:700;color:#fff;background:${SEV_COLOR[v.severity] || '#6b7280'};padding:2px 8px;border-radius:999px;text-transform:uppercase;">${v.severity || 'medium'}</span>
        <div style="font-weight:600;color:#111827;margin-top:6px;">${v.rule}</div>
        <div style="color:#4b5563;margin-top:2px;">${v.description}</div>
        <div style="color:#111827;margin-top:6px;"><strong>Required fix:</strong> ${v.fix}</div>
      </td></tr>`).join('')}
    </table>` : '';
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:640px;margin:0 auto;background:#f8fafc;padding:24px;">
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#4f46e5,#2563eb);padding:20px 24px;color:#fff;font-size:18px;font-weight:700;">Compl<span style="color:#c7d2fe;">AI</span> · Compliance Report</div>
      <div style="padding:24px;">
        <div style="display:inline-block;background:${accent};color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px;text-transform:uppercase;">${decision}</div>
        <h2 style="margin:14px 0 2px;font-size:20px;color:#111827;">${product.name}</h2>
        <div style="color:#6b7280;font-size:13px;">${product.brand || ''}${product.brand ? ' · ' : ''}${product.category}${product.country ? ' · ' + product.country : ''} · ${product.id}</div>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:16px 0;">${messageFor(product, decision, report)}</p>
        ${report ? `<table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:10px;font-size:13px;margin:8px 0;">
          <tr><td style="padding:12px 14px;color:#6b7280;">Compliance score</td><td style="padding:12px 14px;text-align:right;font-weight:700;color:${accent};">${report.score}/100 (${report.riskLevel} risk)</td></tr>
          <tr><td style="padding:12px 14px;color:#6b7280;border-top:1px solid #eee;">Rules passed / failed</td><td style="padding:12px 14px;text-align:right;font-weight:600;color:#111827;border-top:1px solid #eee;">${report.rulesPassed} passed · ${report.rulesFailed} failed</td></tr>
          <tr><td style="padding:12px 14px;color:#6b7280;border-top:1px solid #eee;">AI confidence</td><td style="padding:12px 14px;text-align:right;font-weight:600;color:#111827;border-top:1px solid #eee;">${report.confidence || 90}%</td></tr>
        </table>` : ''}
        ${comment ? `<p style="font-size:13px;color:#374151;margin:12px 0;"><strong>Reviewer note:</strong> ${comment}</p>` : ''}
        ${issues}
        <p style="color:#9ca3af;font-size:12px;margin-top:28px;border-top:1px solid #eee;padding-top:14px;">This is an automated message from ComplAI.</p>
      </div>
    </div>
  </div>`;
}

/** Fire a decision email to the product's vendor (fire-and-forget). Records every attempt. */
export async function sendDecisionEmail(product, decision, comment, report) {
  const to = product.vendorEmail || NOTIFY_EMAIL || SMTP_USER;
  const subject = `${decision === 'Approved' ? '✅ Approved' : '❌ Rejected'}: ${product.name} — Compliance Report`;
  const record = {
    id: generateId('MAIL'), to, subject, decision,
    productId: product.id, productName: product.name, sentAt: new Date().toISOString(),
  };
  if (!to) {
    record.status = 'skipped';
    record.reason = 'no vendor email (add one to the product or set NOTIFY_EMAIL)';
    console.log(`[mail] SKIPPED (${record.reason}) — "${subject}"`);
  } else {
    try {
      const transport = await getTransport();
      const info = await transport.sendMail({
        from: MAIL_FROM || 'ComplAI <no-reply@complai.app>',
        to, subject,
        text: buildText(product, decision, comment, report),
        html: buildHtml(product, decision, comment, report),
      });
      record.status = 'sent';
      record.mode = mailMode;
      record.messageId = info.messageId;
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) record.previewUrl = preview;
      console.log(`[mail] sent "${subject}" → ${to}${preview ? `  ·  preview: ${preview}` : ''}`);
    } catch (err) {
      record.status = 'error';
      record.error = err.message;
      console.warn(`[mail] FAILED "${subject}" → ${to}: ${err.message}`);
    }
  }
  try { Emails().insert(record); } catch { /* non-fatal */ }
  return record;
}

// Marketplace the product goes live on (shown in the publish email).
const MARKETPLACE = process.env.MARKETPLACE_NAME || 'Amazon';

function buildPublishedText(product, platform) {
  const L = [];
  L.push(`PRODUCT PUBLISHED — LIVE ON ${platform.toUpperCase()}`, '');
  L.push(`Product:  ${product.name} (${product.id})`);
  L.push(`Category: ${product.category} · Brand: ${product.brand || 'n/a'}`);
  L.push('', `Great news — "${product.name}" has cleared compliance review and is now published and live on ${platform}. It is available for customers to purchase.`);
  L.push('', '— ComplAI Compliance Team');
  return L.join('\n');
}

function buildPublishedHtml(product, platform) {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:640px;margin:0 auto;background:#f8fafc;padding:24px;">
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#4f46e5,#2563eb);padding:20px 24px;color:#fff;font-size:18px;font-weight:700;">Compl<span style="color:#c7d2fe;">AI</span> · Marketplace</div>
      <div style="padding:24px;">
        <div style="display:inline-block;background:#16a34a;color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px;text-transform:uppercase;">Published</div>
        <h2 style="margin:14px 0 2px;font-size:20px;color:#111827;">🎉 ${product.name} is now live</h2>
        <div style="color:#6b7280;font-size:13px;">${product.brand || ''}${product.brand ? ' · ' : ''}${product.category} · ${product.id}</div>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:16px 0;">Great news — <strong>${product.name}</strong> has cleared compliance review and is now <strong>published and live on ${platform}</strong>. It's available for customers to purchase.</p>
        <p style="color:#9ca3af;font-size:12px;margin-top:28px;border-top:1px solid #eee;padding-top:14px;">This is an automated message from ComplAI.</p>
      </div>
    </div>
  </div>`;
}

/** Notify the vendor that their product went live on the marketplace (fire-and-forget). */
export async function sendPublishedEmail(product, platform = MARKETPLACE) {
  const to = product.vendorEmail || NOTIFY_EMAIL || SMTP_USER;
  const subject = `🎉 Live: ${product.name} — Published to ${platform}`;
  const record = {
    id: generateId('MAIL'), to, subject, decision: 'Published',
    productId: product.id, productName: product.name, sentAt: new Date().toISOString(),
  };
  if (!to) {
    record.status = 'skipped';
    record.reason = 'no vendor email (add one to the product or set NOTIFY_EMAIL)';
    console.log(`[mail] SKIPPED (${record.reason}) — "${subject}"`);
  } else {
    try {
      const transport = await getTransport();
      const info = await transport.sendMail({
        from: MAIL_FROM || 'ComplAI <no-reply@complai.app>',
        to, subject,
        text: buildPublishedText(product, platform),
        html: buildPublishedHtml(product, platform),
      });
      record.status = 'sent';
      record.mode = mailMode;
      record.messageId = info.messageId;
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) record.previewUrl = preview;
      console.log(`[mail] sent "${subject}" → ${to}${preview ? `  ·  preview: ${preview}` : ''}`);
    } catch (err) {
      record.status = 'error';
      record.error = err.message;
      console.warn(`[mail] FAILED "${subject}" → ${to}: ${err.message}`);
    }
  }
  try { Emails().insert(record); } catch { /* non-fatal */ }
  return record;
}
