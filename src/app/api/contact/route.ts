import { NextRequest, NextResponse, after } from 'next/server';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { getPortfolioData } from '@/lib/dataManager';
import { saveMessage } from '@/lib/messageManager';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummykey_123456789');

function emailTemplate({ name, email, subject, message, data }: { name: string; email: string; subject?: string; message: string; data: any }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Message — ${data.fullName}</title>
</head>
<body style="background-color: #090a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; margin: 0; padding: 40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #12141c; border: 1px solid #222533; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); box-sizing: border-box;">
    <!-- Top Gradient Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 32px; text-align: center;">
        <div style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255, 255, 255, 0.85); margin-bottom: 8px; font-weight: 600;">
          Portfolio Inquiry
        </div>
        <h1 style="font-size: 28px; font-weight: 800; color: #ffffff; margin: 0; font-family: inherit; letter-spacing: -0.02em;">
          New message from ${name}
        </h1>
      </td>
    </tr>
    <!-- Content Body -->
    <tr>
      <td style="padding: 40px 32px;">
        <!-- Info Table -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-bottom: 24px; border-bottom: 1px solid #1e2130;">
              <div style="font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #64748b; margin-bottom: 6px; font-weight: 700;">Sender Name</div>
              <div style="font-size: 16px; color: #ffffff; font-weight: 600;">${name}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 0; border-bottom: 1px solid #1e2130;">
              <div style="font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #64748b; margin-bottom: 6px; font-weight: 700;">Email Address</div>
              <div style="font-size: 15px; color: #60a5fa; font-weight: 500;"><a href="mailto:${email}" style="color: #60a5fa; text-decoration: none;">${email}</a></div>
            </td>
          </tr>
          ${subject ? `
          <tr>
            <td style="padding: 20px 0; border-bottom: 1px solid #1e2130;">
              <div style="font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #64748b; margin-bottom: 6px; font-weight: 700;">Subject</div>
              <div style="font-size: 15px; color: #ffffff; font-weight: 500;">${subject}</div>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding-top: 24px; padding-bottom: 32px;">
              <div style="font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #64748b; margin-bottom: 8px; font-weight: 700;">Message Content</div>
              <div style="border-left: 3px solid #8b5cf6; padding-left: 20px; font-size: 15px; line-height: 1.7; color: #cbd5e1; white-space: pre-line; background-color: #1a1c27; padding-top: 16px; padding-bottom: 16px; padding-right: 16px; border-radius: 0 8px 8px 0;">
                ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 16px;">
              <a href="mailto:${email}" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; border-radius: 6px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);">
                Reply to ${name} →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: #0c0e14; padding: 24px 32px; border-top: 1px solid #1e2130; text-align: center; font-size: 11px; color: #475569; line-height: 1.6;">
        This message was submitted via the contact form on your portfolio website.<br/>
        © ${new Date().getFullYear()} ${data.fullName} · All rights reserved
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      console.warn('Contact submission warning: Missing fields', { name, email, message });
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Save message locally / in Netlify Blobs
    try {
      await saveMessage({ name, email, subject, message });
    } catch (saveErr) {
      console.error('Failed to save message:', saveErr);
    }

    const data = await getPortfolioData();
    const targetEmail = data.email || 'placeholder@example.com';

    // Send email asynchronously in the background after the response is sent to client
    after(async () => {
      console.log(`Attempting to send contact form email from onboarding@resend.dev to ${targetEmail}...`);
      try {
        const { data: resData, error } = await resend.emails.send({
          from: 'Portfolio Contact <onboarding@resend.dev>',
          to: targetEmail,
          replyTo: email,
          subject: subject ? `${subject} — ${name}` : `New message from ${name} — Portfolio`,
          html: emailTemplate({ name, email, subject, message, data }),
        });

        if (error) {
          console.error('Resend API Email Error (after):', error);
        } else {
          console.log('Resend API Email Success (after):', resData);
        }
      } catch (err) {
        console.error('Resend API Email Exception (after):', err);
      }
    });

    // Return success immediately so the frontend transition is instantaneous
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact API Unexpected Exception:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
