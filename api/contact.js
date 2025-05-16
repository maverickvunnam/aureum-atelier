// api/contact.js
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, email, phone, message } = req.body;
      
      // Step A: Debug log
      console.log('Request received:', { name, email, hasPhone: !!phone, hasMessage: !!message });
      
      // Step B: Verify environment variables are set
      const envCheck = {
        gmailUser: typeof process.env.GMAIL_USER === 'string',
        gmailPass: typeof process.env.GMAIL_APP_PASSWORD === 'string',
      };
      
      console.log('Environment check:', envCheck);
      
      // Step C: Email sending attempt
      let emailResult = { sent: false, reason: 'Not attempted' };
      
      if (envCheck.gmailUser && envCheck.gmailPass) {
        try {
          console.log('Setting up transporter');
          
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
          
          console.log('Attempting to send email');
          
          // Send email
          const info = await transporter.sendMail(mailOptions);
          
          console.log('Email sent:', info.messageId);
          
          emailResult = {
            sent: true,
            messageId: info.messageId
          };
        } catch (emailError) {
          console.error('Email error:', emailError);
          
          emailResult = {
            sent: false,
            reason: 'Email sending failed',
            error: emailError.message,
            code: emailError.code || 'unknown'
          };
        }
      } else {
        emailResult.reason = 'Environment variables not configured';
      }
      
      // Return the result
      res.status(200).json({
        success: true,
        formData: { name, email, phone, message },
        email: emailResult,
        env: {
          userSet: envCheck.gmailUser,
          passSet: envCheck.gmailPass
        }
      });
    } catch (error) {
      console.error('Handler error:', error);
      
      // Ensure we always return valid JSON
      res.status(500).json({ 
        success: false,
        error: error.message || 'Unknown error',
        type: error.constructor.name
      });
    }
  } else {
    res.status(405).json({ 
      success: false,
      error: 'Method not allowed'
    });
  }
}