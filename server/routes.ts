import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { log } from "./index";
import { Resend } from "resend";

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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = contactFormSchema.parse(req.body);
      
      // Log the contact form submission
      log(`📧 Contact form submission from ${validatedData.name} (${validatedData.email})`, "contact");
      log(`   Subject: ${validatedData.subject}`, "contact");
      log(`   Message: ${validatedData.message}`, "contact");
      
      // Send email using Resend
      if (!resend) {
        log("⚠️  RESEND_API_KEY not configured - email not sent", "contact");
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
          log(`❌ Failed to send email: ${error.message}`, "contact");
          return res.status(500).json({ 
            success: false, 
            message: "Failed to send email. Please try again later." 
          });
        }

        log(`✅ Email sent successfully (ID: ${data?.id})`, "contact");
        
        res.json({ 
          success: true, 
          message: "Message sent successfully!" 
        });
      } catch (emailError: any) {
        log(`❌ Email error: ${emailError.message}`, "contact");
        return res.status(500).json({ 
          success: false, 
          message: "Failed to send email. Please try again later." 
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: error.errors[0].message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Failed to process contact form" 
        });
      }
    }
  });

  return httpServer;
}
