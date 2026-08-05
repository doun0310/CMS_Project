-- Edge Function이 처리해야 할 이벤트 유형을 정의합니다.

const PRICE_IDS = {
    pro_monthly: 'price_1N0X8eL5g6J9kL1a2b3c4d5e',
    pro_yearly: 'price_1N0X8eL5g6J9kL1a2b3c4d5f',
    enterprise_monthly: 'price_1N0X8eL5g6J9kL1a2b3c4d5g',
    enterprise_yearly: 'price_1N0X8eL5g6J9kL1a2b3c4d5h',
}

const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    line_items: [{ price: PRICE_IDS[plan], quantity: 1}],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
})