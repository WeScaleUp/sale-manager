export default function handler(req, res) {
  const shop = process.env.SHOPIFY_STORE;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const redirectUri = `${process.env.APP_URL}/api/callback`;
  const scopes = 'read_products,write_products';
  const nonce = Math.random().toString(36).substring(2);

  res.setHeader('Set-Cookie', `shopify_nonce=${nonce}; HttpOnly; Secure; SameSite=Lax; Path=/`);

  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${nonce}`;
  res.redirect(authUrl);
}
