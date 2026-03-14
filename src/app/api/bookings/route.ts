import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';
import { getNotificationSettings, getSmtpSettings } from '@/lib/settings';
import { getEmailBaseUrl } from '@/lib/emailBaseUrl';

function generateBookingNumber(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `AST-${num}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      serviceSlug,
      serviceTitle,
      amount,
      fullName,
      email,
      phone,
      gender,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      paymentScreenshot,
    } = body;

    if (
      !serviceSlug ||
      !serviceTitle ||
      amount == null ||
      !fullName ||
      !email ||
      !phone ||
      !gender ||
      !dateOfBirth ||
      !timeOfBirth ||
      !placeOfBirth ||
      !paymentScreenshot
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find or create service
    let service = await prisma.service.findUnique({
      where: { slug: serviceSlug },
    });

    if (!service) {
      service = await prisma.service.create({
        data: {
          slug: serviceSlug,
          title: serviceTitle,
          price: new Decimal(amount),
          priceUnit: 'NPR',
          isActive: true,
          sortOrder: 0,
        },
      });
    }

    const bookingNumber = generateBookingNumber();

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        serviceId: service.id,
        fullName,
        email,
        phone,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        timeOfBirth,
        placeOfBirth,
        amount: new Decimal(amount),
        currency: service.priceUnit,
        status: 'PENDING',
        paymentScreenshot,
      },
    });

    // Send email notifications
    const smtpSettings = await getSmtpSettings();
    const notificationSettings = await getNotificationSettings();
    const adminEmails = notificationSettings.orderEmails.length
      ? notificationSettings.orderEmails
      : [process.env.ADMIN_EMAIL || 'admin@3starfoods.com'];

    if (smtpSettings.host && smtpSettings.user && smtpSettings.password) {
      const fromEmail = smtpSettings.fromEmail || 'noreply@3starfoods.com';
      const fromName = smtpSettings.fromName || 'Astra';
      const baseUrl = getEmailBaseUrl();
      const logoUrl = `${baseUrl}/images/logo-vertical.png`;
      const companyName = fromName;

      const transporter = nodemailer.createTransport({
        host: smtpSettings.host,
        port: smtpSettings.port,
        secure: smtpSettings.port === 465,
        requireTLS: smtpSettings.port === 587,
        auth: { user: smtpSettings.user, pass: smtpSettings.password },
      });

      const priceUnit = service?.priceUnit ?? 'NPR';

      function generateBookingEmailHtml(isAdmin: boolean) {
        const title = isAdmin ? 'New Booking Received' : 'Booking Confirmation';
        const greeting = isAdmin
          ? `You have received a new service booking from ${fullName}.`
          : `Thank you for your booking, ${fullName}! We're processing it now.`;
        return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title></head>
<body style="margin:0;padding:0;background-color:#faf8f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf8f6;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr><td style="background-color:#ffffff;padding:30px 40px;text-align:center;border-bottom:3px solid #0d6800;">
          <img src="${logoUrl}" alt="${companyName}" style="max-width:180px;height:auto;display:block;margin:0 auto;" />
        </td></tr>
        <tr><td style="padding:40px;">
          <h1 style="margin:0 0 10px;color:#353E5C;font-size:24px;font-weight:600;">${title}</h1>
          <p style="margin:0 0 20px;color:#f37335;font-size:16px;font-weight:600;">Booking Number: ${bookingNumber}</p>
          <p style="margin:0 0 30px;color:#575d73;font-size:15px;line-height:1.6;">${greeting}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;background-color:#fff5eb;border-radius:4px;overflow:hidden;border:1px solid #e6ccc2;">
            <tr><td style="padding:20px;">
              <h2 style="margin:0 0 15px;color:#353E5C;font-size:18px;font-weight:600;border-bottom:2px solid #0d6800;padding-bottom:10px;">Booking Details</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:8px 0;color:#575d73;font-size:14px;width:40%;"><strong>Service:</strong></td><td style="padding:8px 0;color:#353E5C;font-size:14px;">${serviceTitle}</td></tr>
                <tr><td style="padding:8px 0;color:#575d73;font-size:14px;"><strong>Amount:</strong></td><td style="padding:8px 0;color:#353E5C;font-size:14px;">${priceUnit} ${Number(amount).toFixed(2)}</td></tr>
                <tr><td style="padding:8px 0;color:#575d73;font-size:14px;"><strong>Name:</strong></td><td style="padding:8px 0;color:#353E5C;font-size:14px;">${fullName}</td></tr>
                <tr><td style="padding:8px 0;color:#575d73;font-size:14px;"><strong>Email:</strong></td><td style="padding:8px 0;color:#353E5C;font-size:14px;"><a href="mailto:${email}" style="color:#f37335;text-decoration:none;">${email}</a></td></tr>
                <tr><td style="padding:8px 0;color:#575d73;font-size:14px;"><strong>Phone:</strong></td><td style="padding:8px 0;color:#353E5C;font-size:14px;"><a href="tel:${phone}" style="color:#f37335;text-decoration:none;">${phone}</a></td></tr>
                <tr><td style="padding:8px 0;color:#575d73;font-size:14px;"><strong>Gender:</strong></td><td style="padding:8px 0;color:#353E5C;font-size:14px;text-transform:capitalize;">${gender}</td></tr>
                <tr><td style="padding:8px 0;color:#575d73;font-size:14px;"><strong>Date of Birth:</strong></td><td style="padding:8px 0;color:#353E5C;font-size:14px;">${dateOfBirth}</td></tr>
                <tr><td style="padding:8px 0;color:#575d73;font-size:14px;"><strong>Time of Birth:</strong></td><td style="padding:8px 0;color:#353E5C;font-size:14px;">${timeOfBirth}</td></tr>
                <tr><td style="padding:8px 0;color:#575d73;font-size:14px;"><strong>Place of Birth:</strong></td><td style="padding:8px 0;color:#353E5C;font-size:14px;">${placeOfBirth}</td></tr>
              </table>
              ${paymentScreenshot ? `
              <p style="margin:15px 0 0;color:#575d73;font-size:14px;"><a href="${paymentScreenshot}" target="_blank" style="color:#f37335;text-decoration:underline;font-weight:600;">View Payment Screenshot</a></p>
              <img src="${paymentScreenshot}" alt="Payment Screenshot" style="max-width:100%;height:auto;border:2px solid #e0e0e0;border-radius:4px;display:block;margin-top:10px;" />` : ''}
            </td></tr>
          </table>
          <p style="margin:30px 0 0;color:#575d73;font-size:14px;line-height:1.6;">${isAdmin ? 'Please process this booking and confirm with the customer.' : "We'll contact you shortly. If you have any questions, please contact us."}</p>
        </td></tr>
        <tr><td style="background-color:#0d6800;padding:30px 40px;text-align:center;">
          <p style="margin:0 0 10px;color:#ffffff;font-size:14px;font-weight:600;">${companyName}</p>
          <p style="margin:15px 0 0;color:#ffffff;font-size:11px;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
      }

      const adminHtml = generateBookingEmailHtml(true);
      const customerHtml = generateBookingEmailHtml(false);
      const textContent = `New Booking ${bookingNumber}\n\nService: ${serviceTitle}\nAmount: ${priceUnit} ${Number(amount).toFixed(2)}\n\nName: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nGender: ${gender}\nDOB: ${dateOfBirth}\nTOB: ${timeOfBirth}\nPlace: ${placeOfBirth}\n${paymentScreenshot ? `Payment Screenshot: ${paymentScreenshot}` : ''}`;

      try {
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: adminEmails,
          subject: `New Booking #${bookingNumber} - ${serviceTitle} - ${fullName}`,
          text: textContent,
          html: adminHtml,
        });
      } catch (e) {
        console.error('[BOOKING EMAIL] Failed to send admin notification:', e);
      }

      try {
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: email,
          subject: `Booking Confirmation #${bookingNumber} - ${serviceTitle}`,
          text: textContent,
          html: customerHtml,
        });
      } catch (e) {
        console.error('[BOOKING EMAIL] Failed to send customer confirmation:', e);
      }
    } else {
      console.warn('[BOOKING EMAIL] SMTP settings incomplete. Skipping email dispatch.');
    }

    return NextResponse.json({
      ok: true,
      bookingNumber: booking.bookingNumber,
      id: booking.id,
    });
  } catch (e) {
    console.error('Booking creation error:', e);
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
