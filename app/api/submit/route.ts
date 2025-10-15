import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend("re_8YGxVSjE_Q7rKy9Jgk6FzwhHeEw5GJ2fW");

// Utility to validate email
function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Generate HTML email content
function generateHtmlEmail(data: {
  name: string;
  email: string;
  message?: string;
  countryName?: string;
  countryCode?: string;
  whatsapp?: string;
}): string {
  const { name, email, message, countryName, countryCode, whatsapp } = data;

  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
      <h2 style="color: #3955D9; border-bottom: 2px solid #3955D9; padding-bottom: 5px;">
        📩 New Form Submission
      </h2>

      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
          <td style="font-weight: bold; padding: 5px; width: 150px;">Name:</td>
          <td style="padding: 5px;">${name}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 5px;">Email:</td>
          <td style="padding: 5px;">${email}</td>
        </tr>
        ${countryName ? `<tr><td style="font-weight: bold; padding: 5px;">Country:</td><td style="padding: 5px;">${countryName}</td></tr>` : ""}
        ${countryCode ? `<tr><td style="font-weight: bold; padding: 5px;">Country Code:</td><td style="padding: 5px;">${countryCode}</td></tr>` : ""}
        ${whatsapp ? `<tr><td style="font-weight: bold; padding: 5px;">WhatsApp:</td><td style="padding: 5px;">${whatsapp}</td></tr>` : ""}
      </table>

      ${message ? `<div style="margin-top: 15px;">
        <strong>Message:</strong>
        <p style="padding: 10px; background: #f9f9f9; border-left: 4px solid #3955D9;">${message}</p>
      </div>` : ""}

      <footer style="margin-top: 20px; font-size: 12px; color: #888;">
        This message was sent from your website contact form.
      </footer>
    </div>
  `;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name = "",
      email = "",
      message,
      countryName,
      countryCode,
      whatsapp,
    } = body || {};

    // Validate required fields
    if (!name.trim()) {
      return NextResponse.json(
        { ok: false, error: "Name is required" },
        { status: 400 }
      );
    }

    if (!email.trim() || !isEmailValid(email)) {
      return NextResponse.json(
        { ok: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    const htmlContent = generateHtmlEmail({
      name,
      email,
      message,
      countryName,
      countryCode,
      whatsapp,
    });

    const subject = `${countryName ? "New Appointment Request" : "New Contact Message"} from ${name}`;

    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "info@medivisorhealth.com", // replace with your actual email
      subject,
      html: htmlContent,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message || "Failed to send email" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Error in form submission:", err);
    return NextResponse.json(
      { ok: false, error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
