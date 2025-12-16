const STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_ID; // e.g. "shopteorema"
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN;

// Use a current version
const API_VERSION = '2024-10';
const ENDPOINT = `https://${STORE_DOMAIN}.myshopify.com/api/${API_VERSION}/graphql.json`;

export async function shopifyFetch({ query, variables = {} }) {
  if (!STORE_DOMAIN || !STOREFRONT_TOKEN) {
    console.error('Missing SHOPIFY env vars:', {
      STORE_DOMAIN,
      hasToken: Boolean(STOREFRONT_TOKEN),
    });
    throw new Error('Missing Shopify env vars');
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  // Helpful diagnostics
  const requestId = res.headers.get('x-request-id');
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('Shopify fetch failed', {
      status: res.status,
      statusText: res.statusText,
      requestId,
      body: text,
    });
    throw new Error(`Shopify ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors) {
    console.error('Shopify API Error:', JSON.stringify(json.errors, null, 2), { requestId });
    throw new Error('Shopify GraphQL errors');
  }

  return json.data;
}
