// api/contact.js
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, email, phone, message } = req.body;
      
      // Step 1: Verify environment variables are set
      const envCheck = {
        gmailUser: !!process.env.GMAIL_USER,
        gmailPass: !!process.env.GMAIL_APP_PASSWORD,
        gmailUserSet: process.env.GMAIL_USER ? 'set' : 'not set',
        gmailPassSet: process.env.GMAIL_APP_PASSWORD ? 'set' : 'not set',
      };
      
      // Step 2: Set up transporter (only if env vars are available)
      let emailResult = { sent: false, error: null };
      
      if (envCheck.gmailUser && envCheck.gmailPass) {
        try {
          // Create transporter
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_APP_PASSWORD
            }
          });
          
          // Set up email options
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
          const info = await transporter.sendMail(mailOptions);
          
          emailResult = {
            sent: true,
            messageId: info.messageId,
            response: info.response
          };
        } catch (emailError) {
          emailResult = {
            sent: false,
            error: emailError.message,
            code: emailError.code,
            responseCode: emailError.responseCode,
            command: emailError.command
          };
        }
      }
      
      // Return the result
      res.status(200).json({
        success: true,
        received: { name, email, phone: phone || '(not provided)', message: message || '(not provided)' },
        emailResult: emailResult,
        envCheck: envCheck
      });
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