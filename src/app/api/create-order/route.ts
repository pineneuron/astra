import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/db';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { getNotificationSettings, getSmtpSettings, getWhatsAppSettings } from '@/lib/settings';
import { sendWhatsAppMessage, formatOrderMessage } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.customer || !body.items || !body.summary) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    const {
      customer,
      items,
      summary,
      paymentScreenshot,
      cashOnDelivery,
      couponCode
    } = body as {
      customer: {
        name: string;
        email: string;
        phone: string;
        alternativePhone?: string;
        city: string;
        address: string;
        landmark?: string;
        notes?: string;
        coords?: { lat: number; lng: number } | null;
      };
      items: Array<{ id: string; name: string; qty: number; price: number; image?: string }>;
      summary: { subtotal: number; deliveryFee: number; total: number; belowMinimum: boolean; discountAmount?: number };
      paymentScreenshot?: string;
      cashOnDelivery?: boolean;
      couponCode?: string;
    };

    // Save order to database first
    let savedOrder: Awaited<ReturnType<typeof prisma.order.create>> | null = null;
    try {
      // Check if customer exists by email
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: customer.email }
      });

      const paymentMethod = cashOnDelivery ? 'Cash on Delivery' : (paymentScreenshot ? 'Prepaid' : 'Prepaid');

      // Generate order number
      const orderNumber = `TSF-${Date.now().toString().slice(-6)}`;

      // Map items to database format
      // Convert product slugs/IDs to actual database IDs
      const orderItems = await Promise.all(
        items.map(async (item) => {
          // Try to find product by ID first, then by slug
          let productId: string | null = null;
          
          try {
            // Check if it's already a valid ID (cuid format - typically 25 chars)
            // First try by ID
            const productById = await prisma.product.findUnique({
              where: { id: item.id },
              select: { id: true }
            });
            
            if (productById) {
              productId = productById.id;
            } else {
              // If not found by ID, try finding by slug
              const productBySlug = await prisma.product.findUnique({
                where: { slug: item.id },
                select: { id: true }
              });
              
              if (productBySlug) {
                productId = productBySlug.id;
              } else {
                throw new Error(`Product not found: ${item.id}`);
              }
            }
          } catch (lookupError) {
            console.error(`Error looking up product ${item.id}:`, lookupError);
            throw lookupError; // Re-throw to fail the order creation
          }
          
          if (!productId) {
            throw new Error(`Could not resolve product ID for: ${item.id}`);
          }
          
          return {
            productId: productId,
            productName: item.name,
            productImageUrl: item.image || null,
            variationName: null,
            quantity: item.qty,
            unitPrice: new Prisma.Decimal(item.price),
            discountAmount: new Prisma.Decimal(0),
            totalPrice: new Prisma.Decimal(item.price * item.qty),
          };
        })
      );

      // Get discount amount from applied coupon if available
      const discountAmount = summary.discountAmount || 0;

      // Create order in database
      const orderData: Prisma.OrderCreateInput = {
        orderNumber,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerAlternativePhone: customer.alternativePhone || null,
        customerCity: customer.city,
        customerAddress: customer.address,
        customerLandmark: customer.landmark || null,
        customerCoordinates: customer.coords ? customer.coords : Prisma.JsonNull,
        customerNotes: customer.notes || null,
        paymentScreenshot: paymentScreenshot || null,
        subtotal: new Prisma.Decimal(summary.subtotal),
        deliveryFee: new Prisma.Decimal(summary.deliveryFee),
        discountAmount: new Prisma.Decimal(discountAmount),
        taxAmount: new Prisma.Decimal(0),
        totalAmount: new Prisma.Decimal(summary.total),
        status: OrderStatus.PENDING,
        paymentStatus: cashOnDelivery ? PaymentStatus.PENDING : PaymentStatus.PAID,
        paymentMethod: paymentMethod,
        items: {
          create: orderItems
        },
        statusHistory: {
          create: {
            status: OrderStatus.PENDING,
            notes: 'Order created'
          }
        }
      };

      // Add customer relation if customer exists
      if (existingCustomer?.id) {
        orderData.customer = {
          connect: { id: existingCustomer.id }
        };
      }

      savedOrder = await prisma.order.create({
        data: orderData,
        include: {
          items: true,
          statusHistory: true
        }
      });

      // Link coupon usage if coupon was applied (after order is created)
      if (couponCode && discountAmount > 0) {
        try {
          const coupon = await prisma.coupon.findUnique({
            where: { code: couponCode }
          });
          
          if (coupon) {
            // Update coupon used count
            await prisma.coupon.update({
              where: { id: coupon.id },
              data: {
                usedCount: { increment: 1 }
              }
            });
            
            // Create coupon usage record
            const couponUsageData: Prisma.CouponUsageCreateInput = {
              coupon: {
                connect: { id: coupon.id }
              },
              order: {
                connect: { id: savedOrder.id }
              },
              discountAmount: new Prisma.Decimal(discountAmount)
            };
            
            // Add customer relation if customer exists
            if (existingCustomer?.id) {
              couponUsageData.customer = {
                connect: { id: existingCustomer.id }
              };
            }
            
            await prisma.couponUsage.create({
              data: couponUsageData
            });
          }
        } catch (couponError) {
          console.error('Coupon linking error:', couponError);
          // Don't fail the order if coupon linking fails
        }
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      if (dbError instanceof Error) {
        console.error('Error message:', dbError.message);
        console.error('Error stack:', dbError.stack);
      }
      // Return error if database save fails
      return NextResponse.json({ ok: false, error: 'Failed to save order to database' }, { status: 500 });
    }

    // Only send emails if order was successfully saved
    if (!savedOrder) {
      return NextResponse.json({ ok: false, error: 'Order was not saved' }, { status: 500 });
    }

    // Email configuration (from .env.local)
    const smtpSettings = await getSmtpSettings();
    const fromEmail = smtpSettings.fromEmail || 'orders@3starfoods.com';
    const fromName = smtpSettings.fromName || '3 Star Foods';
    const notificationSettings = await getNotificationSettings();
    const adminEmails = notificationSettings.orderEmails.length
      ? notificationSettings.orderEmails
      : [process.env.ADMIN_EMAIL || 'admin@3starfoods.com'];

    if (!smtpSettings.host || !smtpSettings.user || !smtpSettings.password) {
      console.warn('[ORDER EMAIL] SMTP settings incomplete. Skipping email dispatch.');
      return NextResponse.json({ ok: true });
    }

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: smtpSettings.host,
      port: smtpSettings.port,
      secure: smtpSettings.port === 465, // true for 465 (SSL), false for other ports
      requireTLS: smtpSettings.port === 587, // require TLS for port 587
      auth: {
        user: smtpSettings.user,
        pass: smtpSettings.password,
      },
    });

    // Get base URL for logo
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const logoUrl = `${baseUrl}/images/logo.png`;
    const companyName = fromName;
    const companyAddress = process.env.COMPANY_ADDRESS || '';
    const companyPhone = process.env.COMPANY_PHONE || '';
    const companyEmail = fromEmail;

    // Generate order items HTML
    const itemsHtml = items.map((i) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #e0e0e0;vertical-align:top;">
          <strong style="color:#2c3e50;font-size:14px;display:block;margin-bottom:4px;">${i.name}</strong>
          ${i.image ? `<img src="${i.image.startsWith('http') ? i.image : `${baseUrl}${i.image}`}" alt="${i.name}" style="max-width:60px;height:auto;border:1px solid #e0e0e0;border-radius:4px;margin-top:8px;" />` : ''}
        </td>
        <td style="padding:12px;border-bottom:1px solid #e0e0e0;text-align:center;color:#555;font-size:14px;">${i.qty}</td>
        <td style="padding:12px;border-bottom:1px solid #e0e0e0;text-align:right;color:#555;font-size:14px;">Rs. ${i.price.toFixed(2)}</td>
        <td style="padding:12px;border-bottom:1px solid #e0e0e0;text-align:right;color:#2c3e50;font-weight:600;font-size:14px;">Rs. ${(i.price * i.qty).toFixed(2)}</td>
      </tr>
    `).join('');

    const coordsText = customer.coords ? `${customer.coords.lat}, ${customer.coords.lng}` : 'N/A';
    const mapLink = customer.coords
      ? `https://www.google.com/maps?q=${customer.coords.lat},${customer.coords.lng}`
      : null;

    // Generate email template
    function generateEmailTemplate(isAdmin: boolean, order: typeof savedOrder) {
      if (!order) return '';
      const title = isAdmin ? 'New Order Received' : 'Order Confirmation';
      const greeting = isAdmin
        ? `You have received a new order from ${customer.name}.`
        : `Thank you for your order, ${customer.name}! We're processing it now.`;
      const orderNumberText = `Order Number: ${order.orderNumber}`;

      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background-color:#ffffff;padding:30px 40px;text-align:center;border-bottom:3px solid #0073aa;">
              <img src="${logoUrl}" alt="${companyName}" style="max-width:200px;height:auto;display:block;margin:0 auto;" />
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:40px;">
              
              <!-- Title -->
              <h1 style="margin:0 0 10px;color:#2c3e50;font-size:24px;font-weight:600;line-height:1.3;">${title}</h1>
              
              <!-- Order Number -->
              <p style="margin:0 0 20px;color:#0073aa;font-size:16px;font-weight:600;">${orderNumberText}</p>
              
              <!-- Greeting -->
              <p style="margin:0 0 30px;color:#555;font-size:15px;line-height:1.6;">${greeting}</p>

              <!-- Customer Details Section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;background-color:#f8f9fa;border-radius:4px;overflow:hidden;">
                <tr>
                  <td style="padding:20px;">
                    <h2 style="margin:0 0 15px;color:#2c3e50;font-size:18px;font-weight:600;border-bottom:2px solid #0073aa;padding-bottom:10px;">Customer Details</h2>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;color:#555;font-size:14px;width:40%;"><strong>Name:</strong></td>
                        <td style="padding:8px 0;color:#2c3e50;font-size:14px;">${customer.name}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#555;font-size:14px;"><strong>Email:</strong></td>
                        <td style="padding:8px 0;color:#2c3e50;font-size:14px;"><a href="mailto:${customer.email}" style="color:#0073aa;text-decoration:none;">${customer.email}</a></td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#555;font-size:14px;"><strong>Phone:</strong></td>
                        <td style="padding:8px 0;color:#2c3e50;font-size:14px;"><a href="tel:${customer.phone}" style="color:#0073aa;text-decoration:none;">${customer.phone}</a></td>
                      </tr>
                      ${customer.alternativePhone ? `
                      <tr>
                        <td style="padding:8px 0;color:#555;font-size:14px;"><strong>Alternative Phone:</strong></td>
                        <td style="padding:8px 0;color:#2c3e50;font-size:14px;"><a href="tel:${customer.alternativePhone}" style="color:#0073aa;text-decoration:none;">${customer.alternativePhone}</a></td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding:8px 0;color:#555;font-size:14px;"><strong>City:</strong></td>
                        <td style="padding:8px 0;color:#2c3e50;font-size:14px;">${customer.city}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#555;font-size:14px;"><strong>Address:</strong></td>
                        <td style="padding:8px 0;color:#2c3e50;font-size:14px;">${customer.address}</td>
                      </tr>
                      ${customer.landmark ? `
                      <tr>
                        <td style="padding:8px 0;color:#555;font-size:14px;"><strong>Landmark:</strong></td>
                        <td style="padding:8px 0;color:#2c3e50;font-size:14px;">${customer.landmark}</td>
                      </tr>
                      ` : ''}
                      ${customer.coords ? `
                      <tr>
                        <td style="padding:8px 0;color:#555;font-size:14px;"><strong>Map:</strong></td>
                        <td style="padding:8px 0;color:#2c3e50;font-size:14px;">
                          <a href="${mapLink}" target="_blank" style="color:#0073aa;text-decoration:none;font-weight:600;">View on Google Maps</a>
                          <span style="color:#999;font-size:12px;margin-left:8px;">(${coordsText})</span>
                        </td>
                      </tr>
                      ` : ''}
                      ${customer.notes ? `
                      <tr>
                        <td style="padding:8px 0;color:#555;font-size:14px;vertical-align:top;"><strong>Notes:</strong></td>
                        <td style="padding:8px 0;color:#2c3e50;font-size:14px;">${customer.notes}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Order Items Section -->
              <h2 style="margin:0 0 15px;color:#2c3e50;font-size:18px;font-weight:600;border-bottom:2px solid #0073aa;padding-bottom:10px;">Order Items</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;border:1px solid #e0e0e0;border-radius:4px;overflow:hidden;">
                <thead>
                  <tr style="background-color:#f8f9fa;">
                    <th style="padding:12px;text-align:left;color:#2c3e50;font-size:14px;font-weight:600;border-bottom:2px solid #e0e0e0;">Product</th>
                    <th style="padding:12px;text-align:center;color:#2c3e50;font-size:14px;font-weight:600;border-bottom:2px solid #e0e0e0;">Quantity</th>
                    <th style="padding:12px;text-align:right;color:#2c3e50;font-size:14px;font-weight:600;border-bottom:2px solid #e0e0e0;">Price</th>
                    <th style="padding:12px;text-align:right;color:#2c3e50;font-size:14px;font-weight:600;border-bottom:2px solid #e0e0e0;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Order Summary Section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
                <tr>
                  <td style="padding:0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:4px;overflow:hidden;">
                      <tr>
                        <td style="padding:15px;text-align:right;color:#555;font-size:14px;border-bottom:1px solid #e0e0e0;">
                          <strong>Subtotal:</strong>
                        </td>
                        <td style="padding:15px;text-align:right;color:#2c3e50;font-size:14px;font-weight:600;border-bottom:1px solid #e0e0e0;width:120px;">
                          Rs. ${summary.subtotal.toFixed(2)}
                        </td>
                      </tr>
                      ${summary.deliveryFee > 0 ? `
                      <tr>
                        <td style="padding:15px;text-align:right;color:#555;font-size:14px;border-bottom:1px solid #e0e0e0;">
                          <strong>Delivery Fee:</strong>
                        </td>
                        <td style="padding:15px;text-align:right;color:#2c3e50;font-size:14px;font-weight:600;border-bottom:1px solid #e0e0e0;">
                          Rs. ${summary.deliveryFee.toFixed(2)}
                        </td>
                      </tr>
                      ` : ''}
                      <tr style="background-color:#0073aa;">
                        <td style="padding:20px;text-align:right;color:#ffffff;font-size:16px;font-weight:600;">
                          <strong>Order Total:</strong>
                        </td>
                        <td style="padding:20px;text-align:right;color:#ffffff;font-size:18px;font-weight:700;width:120px;">
                          Rs. ${summary.total.toFixed(2)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Payment Method Section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;background-color:#f8f9fa;border-radius:4px;overflow:hidden;">
                <tr>
                  <td style="padding:20px;">
                    <h2 style="margin:0 0 15px;color:#2c3e50;font-size:18px;font-weight:600;border-bottom:2px solid #0073aa;padding-bottom:10px;">Payment Method</h2>
                    <p style="margin:0 0 15px;color:#555;font-size:14px;">
                      <strong>Payment Type:</strong> 
                      <span style="color:#2c3e50;font-weight:600;">
                        ${cashOnDelivery ? 'Cash on Delivery / Pay Later' : 'Prepaid (Payment Screenshot Provided)'}
                      </span>
                    </p>
                    ${paymentScreenshot ? `
                    <p style="margin:0 0 15px;color:#555;font-size:14px;">
                      <a href="${paymentScreenshot}" target="_blank" style="color:#0073aa;text-decoration:underline;font-weight:600;">View Payment Screenshot</a>
                    </p>
                    <img src="${paymentScreenshot}" alt="Payment Screenshot" style="max-width:100%;height:auto;border:2px solid #e0e0e0;border-radius:4px;display:block;" />
                    ` : ''}
                  </td>
                </tr>
              </table>

              <!-- Footer Message -->
              <p style="margin:30px 0 0;color:#555;font-size:14px;line-height:1.6;">
                ${isAdmin
          ? 'Please process this order and confirm delivery details with the customer.'
          : 'We\'ll send you another email when your order is ready for delivery. If you have any questions, please contact us.'}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#2c3e50;padding:30px 40px;text-align:center;">
              <p style="margin:0 0 10px;color:#ffffff;font-size:14px;font-weight:600;">${companyName}</p>
              ${companyAddress ? `<p style="margin:0 0 5px;color:#b0b0b0;font-size:12px;">${companyAddress}</p>` : ''}
              ${companyPhone ? `<p style="margin:0 0 5px;color:#b0b0b0;font-size:12px;">Phone: <a href="tel:${companyPhone}" style="color:#ffffff;text-decoration:none;">${companyPhone}</a></p>` : ''}
              <p style="margin:0 0 5px;color:#b0b0b0;font-size:12px;">Email: <a href="mailto:${companyEmail}" style="color:#ffffff;text-decoration:none;">${companyEmail}</a></p>
              <p style="margin:15px 0 0;color:#b0b0b0;font-size:11px;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;
    }

    const adminHtml = generateEmailTemplate(true, savedOrder);
    const customerHtml = generateEmailTemplate(false, savedOrder);

    const paymentMethod = cashOnDelivery ? 'Cash on Delivery / Pay Later' : (paymentScreenshot ? 'Prepaid (Payment Screenshot Provided)' : 'Prepaid');
    const textContent = `New Order\n\nOrder Number: ${savedOrder.orderNumber}\n\nName: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone}\n${customer.alternativePhone ? `Alternative Phone: ${customer.alternativePhone}\n` : ''}City: ${customer.city}\nAddress: ${customer.address}\nLandmark: ${customer.landmark || 'N/A'}\n${customer.coords ? `Map: ${mapLink}\nCoordinates: ${coordsText}\n` : ''}${customer.notes ? `Notes: ${customer.notes}\n` : ''}\nPayment Method: ${paymentMethod}\n${paymentScreenshot ? `Payment Screenshot: ${paymentScreenshot}\n` : ''}\nItems:\n${items.map(i => `  ${i.name} - Qty: ${i.qty} - Price: Rs. ${i.price.toFixed(2)} - Total: Rs. ${(i.price * i.qty).toFixed(2)}`).join('\n')}\n\nSubtotal: Rs. ${summary.subtotal.toFixed(2)}\n${summary.deliveryFee > 0 ? `Delivery Fee: Rs. ${summary.deliveryFee.toFixed(2)}\n` : ''}Order Total: Rs. ${summary.total.toFixed(2)}`;

    // Send email to admin
    try {
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: adminEmails,
        subject: `New Order #${savedOrder.orderNumber} - ${customer.name}`,
        text: textContent,
        html: adminHtml
      });
    } catch (emailError) {
      console.error('Failed to send admin email:', emailError);
      // Don't fail the request if email fails - order is already saved
    }

    // Send confirmation email to customer
    try {
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: customer.email,
        subject: `Order Confirmation #${savedOrder.orderNumber} - ${customer.name}`,
        text: textContent,
        html: customerHtml
      });
    } catch (emailError) {
      console.error('Failed to send customer email:', emailError);
      // Don't fail the request if email fails - order is already saved
    }

    // Send WhatsApp notifications to admin numbers
    const whatsappSettings = await getWhatsAppSettings();
    const whatsappNumbers = notificationSettings.orderWhatsAppNumbers || [];

    if (whatsappSettings.accessToken && whatsappSettings.phoneNumberId && whatsappNumbers.length > 0) {
      const orderMessage = formatOrderMessage({
        orderNumber: savedOrder.orderNumber,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        customerAddress: customer.address,
        customerCity: customer.city,
        items: items.map(i => ({
          name: i.name,
          qty: i.qty,
          price: i.price
        })),
        subtotal: summary.subtotal,
        deliveryFee: summary.deliveryFee,
        total: summary.total,
        paymentMethod: paymentMethod,
        paymentScreenshot: paymentScreenshot || undefined
      });

      // Send WhatsApp message to each admin number
      for (const phoneNumber of whatsappNumbers) {
        try {
          const result = await sendWhatsAppMessage(
            {
              accessToken: whatsappSettings.accessToken,
              phoneNumberId: whatsappSettings.phoneNumberId,
              businessAccountId: whatsappSettings.businessAccountId
            },
            {
              to: phoneNumber,
              message: orderMessage
            }
          );

          if (!result.success) {
            console.error(`[WhatsApp] Failed to send to ${phoneNumber}:`, result.error);
          } else {
            console.log(`[WhatsApp] Message sent successfully to ${phoneNumber}`);
          }
        } catch (whatsappError) {
          console.error(`[WhatsApp] Error sending to ${phoneNumber}:`, whatsappError);
          // Don't fail the request if WhatsApp fails - order is already saved
        }
      }
    } else {
      if (whatsappNumbers.length > 0) {
        console.warn('[WhatsApp] WhatsApp settings incomplete. Skipping WhatsApp notifications.');
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error('Create order error:', e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}
