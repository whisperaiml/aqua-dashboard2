export async function getPayPalAccessToken(): Promise<string | null> {
  const apiBase = process.env.PAYPAL_API_BASE;
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!apiBase || !clientId || !clientSecret) {
    console.error('Missing PayPal OAuth configuration.');
    return null;
  }

  try {
    const res = await fetch(`${apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('PayPal token error:', text);
      return null;
    }

    const data: { access_token?: string } = await res.json();
    return data.access_token ?? null;
  } catch (error) {
    console.error('PayPal token fetch error:', error);
    return null;
  }
}
