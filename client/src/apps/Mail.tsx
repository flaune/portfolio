import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOSStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Send, CheckCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export function Mail() {
  const { theme } = useOSStore();
  const isDark = theme === 'dark';
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Client-side rate limiting: prevent rapid submissions
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime;
    const minDelay = 3000; // 3 seconds between submissions

    if (timeSinceLastSubmit < minDelay) {
      setError(`Please wait ${Math.ceil((minDelay - timeSinceLastSubmit) / 1000)} seconds before submitting again.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setLastSubmitTime(now);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const apiResponse = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await apiResponse.json();

      if (apiResponse.ok && data.success) {
        setIsSubmitted(true);
        form.reset();
      } else {
        // Handle specific error codes
        const errorMessage = getErrorMessage(data.error, data.message, apiResponse.status);
        setError(errorMessage);
      }
    } catch (err) {
      clearTimeout(timeoutId);

      // Handle different error types
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out. Please check your connection and try again.');
        } else if (err.message.includes('Failed to fetch')) {
          setError('Network error. Please check your internet connection.');
        } else {
          setError('Unable to send message. Please try again later.');
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Convert error codes to user-friendly messages
  function getErrorMessage(errorCode: string | undefined, fallbackMessage: string, statusCode: number): string {
    switch (errorCode) {
      case 'TOO_MANY_REQUESTS':
        return 'Too many requests. Please wait a few minutes and try again.';
      case 'VALIDATION_ERROR':
        return fallbackMessage; // Use specific validation message
      case 'SERVICE_UNAVAILABLE':
        return 'Service temporarily unavailable. Please try again in a few moments.';
      case 'EMAIL_FAILED':
        return 'Unable to send message at this time. Please try again later.';
      case 'REQUEST_TIMEOUT':
        return 'Request took too long. Please try again.';
      case 'INTERNAL_ERROR':
        return 'An error occurred. Please try again later.';
      default:
        // Handle by status code if no error code provided
        if (statusCode === 429) {
          return 'Too many requests. Please wait a few minutes and try again.';
        } else if (statusCode >= 500) {
          return 'Server error. Please try again later.';
        } else if (statusCode >= 400) {
          return fallbackMessage || 'Invalid request. Please check your input.';
        }
        return fallbackMessage || 'Failed to send message. Please try again.';
    }
  }

  const handleNewMessage = () => {
    setIsSubmitted(false);
    setError(null);
  };

  if (isSubmitted) {
    return (
      <div className={cn(
        "h-full flex flex-col items-center justify-center p-8",
        !isDark && "bg-white text-gray-900",
        isDark && "bg-black/80 text-blue-100"
      )}>
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center mb-6",
          !isDark && "bg-green-100",
          isDark && "bg-green-900/30"
        )}>
          <CheckCircle className={cn(
            "w-12 h-12",
            !isDark && "text-green-600",
            isDark && "text-green-400"
          )} />
        </div>
        <h2 className={cn(
          "text-2xl font-bold mb-2",
          isDark && "text-blue-100"
        )}>
          Message Sent!
        </h2>
        <p className={cn(
          "text-center mb-6 opacity-70 max-w-md",
          isDark && "text-blue-200"
        )}>
          Thanks for reaching out! I'll get back to you as soon as possible.
        </p>
        <Button
          onClick={handleNewMessage}
          variant="outline"
          className={cn(
            "gap-2",
            isDark && "border-blue-500/50 hover:bg-blue-500/20 text-blue-300"
          )}
          data-testid="button-new-message"
        >
          <ArrowLeft className="w-4 h-4" /> Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "h-full flex flex-col",
      !isDark && "bg-white text-gray-900",
      isDark && "bg-black/80 text-blue-100"
    )}>
      <div className={cn(
        "h-12 border-b flex items-center px-4 gap-4",
        !isDark && "bg-gray-100 border-gray-200",
        isDark && "bg-white/5 border-blue-500/20"
      )}>
        <Button 
          variant="outline" 
          size="sm"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className={cn(
            "gap-2",
            isDark && "border-blue-500/50 hover:bg-blue-500/20 text-blue-300"
          )}
          data-testid="button-send"
        >
          <Send className="w-4 h-4" /> {isSubmitting ? 'Sending...' : 'Send'}
        </Button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="space-y-4 max-w-2xl mx-auto"
          data-testid="form-contact"
        >
          {error && (
            <div className={cn(
              "p-3 rounded-lg text-sm",
              !isDark && "bg-red-50 text-red-600 border border-red-200",
              isDark && "bg-red-900/20 text-red-400 border border-red-500/30"
            )} data-testid="text-error">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium opacity-70 uppercase tracking-wider">From</label>
              <Input 
                placeholder="Your Name" 
                {...form.register("name")}
                className={cn(!isDark ? "bg-gray-50" : "bg-white/5 border-blue-500/30 focus-visible:ring-blue-500")}
                data-testid="input-name"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium opacity-70 uppercase tracking-wider">Email</label>
              <Input 
                placeholder="your@email.com" 
                {...form.register("email")}
                className={cn(!isDark ? "bg-gray-50" : "bg-white/5 border-blue-500/30 focus-visible:ring-blue-500")}
                data-testid="input-email"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium opacity-70 uppercase tracking-wider">Subject</label>
            <Input 
              placeholder="Project Inquiry..." 
              {...form.register("subject")}
              className={cn(!isDark ? "bg-gray-50" : "bg-white/5 border-blue-500/30 focus-visible:ring-blue-500")}
              data-testid="input-subject"
            />
            {form.formState.errors.subject && (
              <p className="text-xs text-red-500">{form.formState.errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium opacity-70 uppercase tracking-wider">Message</label>
            <Textarea 
              placeholder="Type your message here..." 
              className={cn("min-h-[200px] resize-none", !isDark ? "bg-gray-50" : "bg-white/5 border-blue-500/30 focus-visible:ring-blue-500")}
              {...form.register("message")}
              data-testid="input-message"
            />
            {form.formState.errors.message && (
              <p className="text-xs text-red-500">{form.formState.errors.message.message}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
