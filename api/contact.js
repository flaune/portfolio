import { z } from 'zod';
import { Resend } from 'resend';

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Initialize Resend (get API key from environment variable)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function log(message, source = "contact") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const validatedData = contactFormSchema.parse(req.body);

    // Log the contact form submission
    log(`📧 Contact form submission from ${validatedData.name} (${validatedData.email})`);
    log(`   Subject: ${validatedData.subject}`);
    log(`   Message: ${validatedData.message}`);

    // Send email using Resend
    if (!resend) {
      log("⚠️  RESEND_API_KEY not configured - email not sent");
      return res.status(500).json({
        success: false,
        message: "Email service not configured. Please contact the site administrator."
      });
    }

    const recipientEmail = process.env.CONTACT_EMAIL || "your-email@example.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";

    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        replyTo: validatedData.email,
        subject: `Portfolio Contact: ${validatedData.subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${validatedData.name} (${validatedData.email})</p>
          <p><strong>Subject:</strong> ${validatedData.subject}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${validatedData.message.replace(/\n/g, '<br>')}</p>
        `,
        text: `
New Contact Form Submission

From: ${validatedData.name} (${validatedData.email})
Subject: ${validatedData.subject}

Message:
${validatedData.message}
        `.trim(),
      });

      if (error) {
        log(`❌ Failed to send email: ${error.message}`);
        return res.status(500).json({
          success: false,
          message: "Failed to send email. Please try again later."
        });
      }

      log(`✅ Email sent successfully (ID: ${data?.id})`);

      return res.status(200).json({
        success: true,
        message: "Message sent successfully!"
      });
    } catch (emailError) {
      log(`❌ Email error: ${emailError.message}`);
      return res.status(500).json({
        success: false,
        message: "Failed to send email. Please try again later."
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to process contact form"
      });
    }
  }
}
