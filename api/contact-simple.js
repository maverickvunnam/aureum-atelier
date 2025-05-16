// api/contact-simple.js - basic version without email functionality
export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, email, phone, message } = req.body;
      
      return res.status(200).json({
        success: true,
        formReceived: true,
        data: { name, email, phone, message },
        emailNote: "Email functionality disabled in this endpoint. Use for testing only."
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Unknown error'
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
}