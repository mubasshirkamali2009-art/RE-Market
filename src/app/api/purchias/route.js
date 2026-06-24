import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { stripe } from '../../../lib/stripe'

import { auth } from '@/lib/auth'

export async function POST(request) {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')
const usersession = await auth.api.getSession({
    headers:await headers()
})

const user =usersession?.user
const formData=await request.formData();
const price =formData.get('price')
const name =formData.get('name')
const productId=formData.get('productId')
const userEmail = formData.get('userEmail') // Pass this from client
    const userId = formData.get('userId')





    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
        customer_email: user?.email,
      line_items: [
        {
          // Provide the exact Price ID (for example, price_1234) of the product you want to sell
  price_data: {
        currency: "usd" ,
        unit_amount: Number(price) * 100 , 
        product_data: {
          name: name ,
        }
       }  ,
          quantity: 1,
        },
      ],
      metadata:{
        priceId: Number(price),
        userId: user.id ,
        userEmail: user.email ,
        name,
        productId ,
        userId ,
        userEmail
      },
      mode: 'payment',
      success_url: `${origin}/priceing/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    });
    return NextResponse.redirect(session.url, 303)
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    )
  }
}