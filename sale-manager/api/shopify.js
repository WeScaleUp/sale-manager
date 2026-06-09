export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Shopify-Store, X-Shopify-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const store = req.headers['x-shopify-store'];
  const token = req.headers['x-shopify-token'];
  const { endpoint } = req.query;

  if (!store || !token || !endpoint) {
    return res.status(400).json({ error: 'Missende headers of endpoint' });
  }

  const url = `https://${store}/admin/api/2024-01/${endpoint}`;

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

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const linkHeader = response.headers.get('Link');
    if (linkHeader) res.setHeader('X-Shopify-Link', linkHeader);

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
