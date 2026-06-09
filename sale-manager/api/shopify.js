export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Parse cookies
  const cookies = Object.fromEntries(
    (req.headers.cookie || '').split(';').map(c => c.trim().split('=').map(decodeURIComponent))
  );

  const token = cookies['shopify_token'];
  const shop = cookies['shopify_shop'];

  if (!token || !shop) {
    return res.status(401).json({ error: 'Niet ingelogd', redirect: '/api/auth' });
  }

  const { endpoint } = req.query;
  if (!endpoint) return res.status(400).json({ error: 'Geen endpoint opgegeven' });

  const url = `https://${shop}/admin/api/2024-01/${endpoint}`;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
      body: ['PUT', 'POST'].includes(req.method) ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    const linkHeader = response.headers.get('Link');
    if (linkHeader) res.setHeader('X-Shopify-Link', linkHeader);

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
