const { Resend } = require('resend');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const resend = new Resend(process.env.RESEND_API_KEY);

const OK = (res, data) => res.status(200).json({ ok: true, ...data });
const FAIL = (res, status, message) => res.status(status).json({ ok: false, error: message });

const parseJsonBody = (req) =>
  new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        resolve(null);
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return FAIL(res, 405, 'Method not allowed');
  }

  const body = await parseJsonBody(req);
  if (!body) {
    return FAIL(res, 400, 'Invalid JSON body');
  }

  const name = String(body.name || '').trim().slice(0, 200);
  const email = String(body.email || '').trim().slice(0, 254);
  const message = String(body.message || '').trim().slice(0, 5000);

  if (!name) return FAIL(res, 400, 'Name is required');
  if (!email || !EMAIL_REGEX.test(email)) return FAIL(res, 400, 'A valid email is required');
  if (!message) return FAIL(res, 400, 'Message is required');

  const to = process.env.CONTACT_TO;
  if (!to) {
    console.error('CONTACT_TO env var is not set');
    return FAIL(res, 500, 'Server is not configured to receive messages.');
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM || 'Portfolio Contact <onboarding@resend.dev>',
      to,
      reply_to: email,
      subject: `Portfolio message from ${name}`,
      html: `
        <h2>New message from the portfolio contact form</h2>
        <p><strong>Name:</strong> ${name.replace(/</g, '&lt;')}</p>
        <p><strong>Email:</strong> <a href="mailto:${email.replace(/</g, '&lt;')}">${email.replace(/</g, '&lt;')}</a></p>
        <hr>
        <p style="white-space: pre-wrap;">${message.replace(/</g, '&lt;')}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return FAIL(res, 500, 'Failed to send message. Please try again later.');
    }

    return OK(res, { sent: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    return FAIL(res, 500, 'Failed to send message. Please try again later.');
  }
};