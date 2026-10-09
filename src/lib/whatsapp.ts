import { CustomerOrder } from '../types';
import { STORE_CENTRE_INFO } from '../data/clothingData';
import { formatPrice } from './format';

/**
 * Strip non-digits; if 10 digits, prefix 91.
 */
export function normalizePhone(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Build wa.me link with encoded text message.
 */
export function buildLink(phone: string, text: string): string {
  const cleanPhone = normalizePhone(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Prefilled order details message for order confirmation screen.
 */
export function buildOrderMessage(order: CustomerOrder): string {
  const itemList = order.items
    .map(
      (it) =>
        `• ${it.item.name} (${it.selectedSize}${it.selectedColor?.name ? `, ${it.selectedColor.name}` : ''}) × ${it.quantity} - ${formatPrice(it.item.price * it.quantity)}`
    )
    .join('\n');

  const fulfilment =
    order.customer.deliveryType === 'store_pickup'
      ? `Boutique Pickup (${order.customer.pickupSlot || 'Standard slot'})`
      : `Home Delivery: ${order.customer.shippingAddress || 'Address on file'}`;

  return [
    `*Order Details - ${STORE_CENTRE_INFO.name}*`,
    `Order ID: #${order.id}`,
    `Customer: ${order.customer.name} (${order.customer.phone})`,
    `Total Amount: ${formatPrice(order.totalAmount)}`,
    `Fulfilment: ${fulfilment}`,
    ...(order.customer.notes ? [`Note: "${order.customer.notes}"`] : []),
    ``,
    `*Items:*`,
    itemList,
    ``,
    `Thank you for shopping at ${STORE_CENTRE_INFO.name}, Oddanchatram!`
  ].join('\n');
}

/**
 * Friendly status message template for each order status.
 */
export function buildStatusMessage(
  order: CustomerOrder,
  status: CustomerOrder['status']
): string {
  const customerName = order.customer.name || 'Valued Customer';
  const orderId = order.id;

  switch (status) {
    case 'Confirmed':
      return `Hello ${customerName}, your order #${orderId} has been confirmed at ${STORE_CENTRE_INFO.name}! We are carefully preparing your garments.`;

    case 'Ready for Pickup':
      return `Hello ${customerName}, wonderful news! Your order #${orderId} is packed and ready for pickup at our ${STORE_CENTRE_INFO.name} boutique counter in Oddanchatram. Please show your order ID #${orderId} when collecting.`;

    case 'Dispatched':
      return `Hello ${customerName}, your order #${orderId} from ${STORE_CENTRE_INFO.name} has been dispatched for delivery. It is on its way to your address!`;

    case 'Completed':
      return `Hello ${customerName}, your order #${orderId} has been completed! Thank you for choosing ${STORE_CENTRE_INFO.name}. We hope you love your collection.`;

    case 'Cancelled':
      return `Hello ${customerName}, your order #${orderId} at ${STORE_CENTRE_INFO.name} has been cancelled. Please reply to this message if you have any questions or need help.`;

    default:
      return `Hello ${customerName}, updating you on your ${STORE_CENTRE_INFO.name} order #${orderId}: status is currently "${status}".`;
  }
}
