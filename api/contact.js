// api/contact.js - simplified version
export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, email, phone, message } = req.body;
      
      // For testing, just return success without sending email
      res.status(200).json({
        success: true,
        received: { name, email, phone, message },
        message: "Form data received successfully. Email sending is disabled for testing."
      });
      
      // We'll add actual email sending later once we confirm the endpoint works
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  } else {
    res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }
}