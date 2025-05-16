// api/contact.js - simplified with dynamic import for Vercel
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, email, phone, message } = req.body;
      
      // Load nodemailer dynamically
      let nodemailer;
      try {
        nodemailer = await import('nodemailer');
      } catch (importError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to load email module',
          details: importError.message
        });
      }
      
      // Verify environment variables
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        return res.status(200).json({
          success: false,
          error: 'Email configuration missing',
          missingVars: {
            GMAIL_USER: !process.env.GMAIL_USER,
            GMAIL_APP_PASSWORD: !process.env.GMAIL_APP_PASSWORD
          }
        });
      }
      
      // Create transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });
      
      // Define email
      const mailOptions = {
        from: `"Aureum Website" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: `New Consultation Request from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nMessage: ${message || 'No message provided'}`,
        html: `
          <h2>New Consultation Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Message:</strong> ${message || 'No message provided'}</p>
        `,
        replyTo: email
      };
      
      // Send email
      try {
        const info = await transporter.sendMail(mailOptions);
        
        return res.status(200).json({
          success: true,
          messageId: info.messageId,
          formData: { name, email, phone, message }
        });
      } catch (emailError) {
        return res.status(200).json({
          success: false,
          error: 'Failed to send email',
          details: emailError.message,
          code: emailError.code,
          formData: { name, email, phone, message }
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Server error',
        details: error.message
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
}