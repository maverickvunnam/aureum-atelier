// api/contact-email.js - with email functionality
import * as nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, email, phone, message } = req.body;
      
      // Check environment variables
      const emailConfig = {
        userSet: !!process.env.GMAIL_USER,
        passwordSet: !!process.env.GMAIL_APP_PASSWORD
      };
      
      // Initialize email result
      let emailResult = {
        attempted: false,
        success: false,
        details: "Email sending not attempted"
      };
      
      // Only try to send email if config is available
      if (emailConfig.userSet && emailConfig.passwordSet) {
        try {
          emailResult.attempted = true;
          
          // Create transporter
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_APP_PASSWORD
            }
          });
          
          // Format message for HTML (convert line breaks to <br> tags)
          // Trim whitespace to remove leading/trailing spaces
          const cleanMessage = (message || 'No message provided').trim();
          const htmlMessage = cleanMessage
            .replace(/\n/g, '<br>')
            .replace(/\r/g, '');
          
          // Define email content
          const mailOptions = {
            from: `"Aureum Atelier Website" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            subject: `Aureum Atelier: New Consultation Request from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${cleanMessage}`,
            html: `
              <h2>New Consultation Request</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
              <p><strong>Message:</strong></p>
              <div style="white-space: pre-wrap; font-family: Arial, sans-serif; line-height: 1.6;">${htmlMessage}</div>
            `,
            replyTo: email
          };
          
          // Send email
          const info = await transporter.sendMail(mailOptions);
          
          emailResult.success = true;
          emailResult.details = "Email sent successfully";
          emailResult.messageId = info.messageId;
        } catch (emailError) {
          emailResult.success = false;
          emailResult.details = "Failed to send email";
          emailResult.error = emailError.message;
          emailResult.code = emailError.code || "UNKNOWN";
        }
      }
      
      // Return complete status
      return res.status(200).json({
        success: true,
        formData: { name, email, phone, message },
        email: emailResult,
        config: emailConfig
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
