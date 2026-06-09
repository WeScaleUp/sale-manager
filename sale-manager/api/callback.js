export default async function handler(req, res) {
  const { code, state, shop } = req.query;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  const appUrl = process.env.APP_URL;

  if (!code || !state) {
    return res.status(400).send('Ongeldige callback parameters');
  }

  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
    });

    const { access_token } = await tokenRes.json();

    if (!access_token) {
      return res.status(400).send('Token ophalen mislukt');
    }

    // Store token in a secure cookie (httpOnly)
    res.setHeader('Set-Cookie', `shopify_token=${access_token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`);
    res.setHeader('Set-Cookie', `shopify_shop=${shop}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`);

    res.redirect(`${appUrl}?connected=true`);
  } catch (e) {
    res.status(500).send('OAuth fout: ' + e.message);
  }
}
