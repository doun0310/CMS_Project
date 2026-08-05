-- 주요 API

--(Payment Intent 정보 요정)
stripe.PaymentIntent.retrieve(pi_id=pi_id)

--(Payment Intent 정보 수정)
stripe.PaymentIntent.modify(pi_id=pi_id, **kwargs)

--(Payment Intent 생성 및 Client Secret 발급)
stripe.PaymentIntent.create(amout=amout, currency=currency)

--(환불)
stripe.Refund.create(charge=ch_id)

-- (영수증 전송)
stripe.PaymentIntent.modify(pi_id, receipt_email="abc@abc.com")

-- Edge Function이 처리해야 할 이벤트 유형을 정의합니다.

switch (event.type) {
  case 'checkout.session.completed':
    // Handle successful payment intent
    break;
  case 'customer.subscription.updated':
    // Handle failed payment intent
    break;
  case 'customer.subscription.deleted':
    // Handle refunded charge
    break;
  case 'invoice.payment_failed':
    // Handle subscription cancellation
    break;
  default:
    // Handle other event types
    break;
}