/**
 * WhatsApp Cloud API integration for sending order notifications
 * Uses Meta's WhatsApp Cloud API
 */

export type WhatsAppConfig = {
  accessToken: string
  phoneNumberId: string
  businessAccountId?: string
  verifyToken?: string
}

export type WhatsAppMessage = {
  to: string // Phone number in E.164 format (e.g., +9779812345678)
  message: string
}

/**
 * Validates a phone number and converts it to E.164 format
 * @param phone - Phone number (can be with or without country code)
 * @param defaultCountryCode - Default country code if not provided (default: +977 for Nepal)
 * @returns Phone number in E.164 format
 */
export function formatPhoneNumber(phone: string, defaultCountryCode: string = '+977'): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // If already starts with country code, return with +
  if (phone.startsWith('+')) {
    return `+${digits}`
  }
  
  // If starts with 0, remove it (Nepal local format)
  const cleaned = digits.startsWith('0') ? digits.slice(1) : digits
  
  // Add country code if not present
  const countryCode = defaultCountryCode.replace(/\D/g, '')
  if (cleaned.startsWith(countryCode)) {
    return `+${cleaned}`
  }
  
  return `+${countryCode}${cleaned}`
}

/**
 * Sends a WhatsApp message using Meta's WhatsApp Cloud API
 * @param config - WhatsApp API configuration
 * @param message - Message details
 * @returns Promise<boolean> - true if sent successfully
 */
export async function sendWhatsAppMessage(
  config: WhatsAppConfig,
  message: WhatsAppMessage
): Promise<{ success: boolean; error?: string }> {
  try {
    const { accessToken, phoneNumberId } = config
    
    if (!accessToken || !phoneNumberId) {
      return { success: false, error: 'WhatsApp API credentials not configured' }
    }
    
    // Format phone number to E.164 format
    const formattedPhone = formatPhoneNumber(message.to)
    
    // WhatsApp Cloud API endpoint
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: {
          body: message.message,
        },
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[WhatsApp] API Error:', errorData)
      return {
        success: false,
        error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
      }
    }
    
    const data = await response.json()
    
    if (data.error) {
      console.error('[WhatsApp] API Error:', data.error)
      return {
        success: false,
        error: data.error.message || 'Unknown WhatsApp API error',
      }
    }
    
    console.log('[WhatsApp] Message sent successfully:', data)
    return { success: true }
  } catch (error) {
    console.error('[WhatsApp] Error sending message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Formats order details into a WhatsApp message
 */
export function formatOrderMessage(orderDetails: {
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string
  customerAddress: string
  customerCity: string
  items: Array<{ name: string; qty: number; price: number }>
  subtotal: number
  deliveryFee: number
  total: number
  paymentMethod: string
  paymentScreenshot?: string
}): string {
  const itemsText = orderDetails.items
    .map(item => `  • ${item.name} x${item.qty} = Rs. ${(item.price * item.qty).toFixed(2)}`)
    .join('\n')
  
  let message = `🛒 *New Order Received*\n\n`
  message += `*Order #:* ${orderDetails.orderNumber}\n\n`
  message += `*Customer Details:*\n`
  message += `Name: ${orderDetails.customerName}\n`
  message += `Phone: ${orderDetails.customerPhone}\n`
  message += `Email: ${orderDetails.customerEmail}\n`
  message += `City: ${orderDetails.customerCity}\n`
  message += `Address: ${orderDetails.customerAddress}\n\n`
  message += `*Order Items:*\n${itemsText}\n\n`
  message += `*Summary:*\n`
  message += `Subtotal: Rs. ${orderDetails.subtotal.toFixed(2)}\n`
  if (orderDetails.deliveryFee > 0) {
    message += `Delivery Fee: Rs. ${orderDetails.deliveryFee.toFixed(2)}\n`
  }
  message += `*Total: Rs. ${orderDetails.total.toFixed(2)}*\n\n`
  message += `*Payment Method:* ${orderDetails.paymentMethod}\n`
  
  if (orderDetails.paymentScreenshot) {
    message += `\nPayment Screenshot: ${orderDetails.paymentScreenshot}`
  }
  
  return message
}

