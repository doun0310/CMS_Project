-- Edge Function이 처리해야 할 이벤트 유형을 정의합니다.

switch (event.type) {
  case 'checkout.session.completed':
    // Handle successful payment intent
    break;
  case 'customer.subscription.updated':
    // Handle failed payment intent
    break;
  case 'costomer.subscription.deleted':
    // Handle refunded charge
    break;
  case 'invoice.payment_failed':
    // Handle subscription cancellation
    break;
  default:
    // Handle other event types
    break;
}