import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '../../../lib/stripe'
import { auth } from '@/lib/auth'

export async function POST(request) {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')
    const usersession = await auth.api.getSession({
        headers: await headers()
    })

    const user = usersession?.user

    if (!user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const formData = await request.formData();
    const price = formData.get('price')
    const name = formData.get('name')
    const productId = formData.get('productId')

    // Price filtering and integer parsing safely
    const unitAmount = Math.round(Number(price) * 100);

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: unitAmount, 
            product_data: {
              name: name,
            }
          },
          quantity: 1,
        },
      ],
      // ─── METADATA FIXED: REPEATED KEYS REMOVED ───
      metadata: {
        price: String(price),
        name: name,
        productId: productId || "",
        userId: user.id || "",
        userEmail: user.email || ""
      },
      mode: 'payment',
      success_url: `${origin}/priceing/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    return NextResponse.redirect(session.url, 303)
  } catch (err) {
    console.error("Stripe Session Error: ", err);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    )
  }
}