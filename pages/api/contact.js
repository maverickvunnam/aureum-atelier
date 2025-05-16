// api/contact.js
export default function handler(req, res) {
  // Just a basic test response for now
  if (req.method === 'POST') {
    const { name, email, phone, message } = req.body;
    
    res.status(200).json({
      success: true,
      receivedData: { name, email, phone, message },
      message: "API endpoint is working, but email sending is disabled for testing"
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}