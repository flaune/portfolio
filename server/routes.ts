import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { log } from "./index";
import { Resend } from "resend";
import rateLimit from "express-rate-limit";

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

// Rate limiting configuration for contact form
// Protects against spam and abuse without revealing system details
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: {
    success: false,
    error: "TOO_MANY_REQUESTS",
    message: "Too many requests. Please try again later."
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    log(`⚠️ Rate limit exceeded for IP: ${req.ip}`, "security");
    res.status(429).json({
      success: false,
      error: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please try again later."
    });
  },
});

// Sanitize user input to prevent XSS in emails
function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Contact form endpoint with rate limiting
  app.post("/api/contact", contactLimiter, async (req, res) => {
    try {
      // Validate input data
      const validatedData = contactFormSchema.parse(req.body);

      // Log the contact form submission (without sensitive details in production)
      log(`📧 Contact form submission from ${validatedData.name}`, "contact");

      // Check if email service is configured
      if (!resend) {
        log("⚠️  Email service not configured", "contact");
        return res.status(503).json({
          success: false,
          error: "SERVICE_UNAVAILABLE",
          message: "Service temporarily unavailable. Please try again later."
        });
      }

      const recipientEmail = process.env.CONTACT_EMAIL || "your-email@example.com";
      const fromEmail = process.env.RESEND_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";

      // Send email with timeout protection
      const emailPromise = resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        replyTo: validatedData.email,
        subject: `Portfolio Contact: ${sanitizeHtml(validatedData.subject)}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${sanitizeHtml(validatedData.name)} (${sanitizeHtml(validatedData.email)})</p>
          <p><strong>Subject:</strong> ${sanitizeHtml(validatedData.subject)}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${sanitizeHtml(validatedData.message)}</p>
        `,
        text: `
New Contact Form Submission

From: ${validatedData.name} (${validatedData.email})
Subject: ${validatedData.subject}

Message:
${validatedData.message}
        `.trim(),
      });

      // Add timeout to email sending (30 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("REQUEST_TIMEOUT")), 30000);
      });

      try {
        const { data, error } = await Promise.race([
          emailPromise,
          timeoutPromise
        ]) as any;

        if (error) {
          // Log error details for debugging (server-side only)
          log(`❌ Email service error: ${error.message}`, "contact");

          return res.status(500).json({
            success: false,
            error: "EMAIL_FAILED",
            message: "Unable to send message. Please try again later."
          });
        }

        log(`✅ Email sent successfully (ID: ${data?.id})`, "contact");

        res.json({
          success: true,
          message: "Message sent successfully!"
        });
      } catch (emailError: any) {
        // Handle timeout or network errors
        if (emailError.message === "REQUEST_TIMEOUT") {
          log(`⏱️ Email request timeout`, "contact");
          return res.status(504).json({
            success: false,
            error: "REQUEST_TIMEOUT",
            message: "Request took too long. Please try again."
          });
        }

        // Generic email error (don't expose internal details)
        log(`❌ Email error: ${emailError.message}`, "contact");
        return res.status(500).json({
          success: false,
          error: "EMAIL_FAILED",
          message: "Unable to send message. Please try again later."
        });
      }
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        log(`⚠️ Validation error: ${error.errors[0].message}`, "contact");
        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: error.errors[0].message
        });
      }

      // Handle unexpected errors (don't expose details)
      log(`❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`, "contact");
      return res.status(500).json({
        success: false,
        error: "INTERNAL_ERROR",
        message: "An error occurred. Please try again later."
      });
    }
  });

  return httpServer;
}
