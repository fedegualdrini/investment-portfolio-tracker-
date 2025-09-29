export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // For now, we'll create a mock checkout URL
    // In production, you would integrate with Paddle's actual API
    const checkoutUrl = `https://checkout.paddle.com/product/your-product-id?email=${encodeURIComponent(email)}&custom_data=${encodeURIComponent(JSON.stringify({ userId }))}`;

    res.status(200).json({ 
      checkoutUrl,
      message: 'Checkout session created successfully'
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
