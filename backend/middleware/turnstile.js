const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

async function verifyTurnstile(req, res, next) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('TURNSTILE_SECRET_KEY not set — skipping Turnstile verification');
    return next();
  }

  const token = req.body['cf-turnstile-token'];
  if (!token) {
    return res.status(400).json({ message: 'Missing Turnstile verification token.' });
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token);
    formData.append('remoteip', req.ip);

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(403).json({ message: 'Turnstile verification failed. Please refresh and try again.' });
    }

    next();
  } catch (err) {
    console.error('Turnstile verification error:', err.message);
    return res.status(500).json({ message: 'Verification service unavailable.' });
  }
}

module.exports = { verifyTurnstile };
