import { stripe } from '@/lib/stripe'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Success({ searchParams }) {
  // Await searchParams in Next.js 15+
  const { session_id } = await searchParams

  if (!session_id) {
    throw new Error('Please provide a valid session_id (`cs_test_...`)')
  }

  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent']
  })

  if (session.status === 'open') {
    return redirect('/')
  }

  if (session.status === 'complete') {
    // You can access metadata parameters you saved earlier right here:
    const productName = session.metadata?.name;
    const customerEmail = session.customer_details?.email || session.metadata?.userEmail;

    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            ✓
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-sm text-gray-600 mb-6">
            Thank you for purchasing <strong>{productName}</strong>. A confirmation email has been dispatched to <span className="font-medium text-gray-900">{customerEmail}</span>.
          </p>
          <Link
            href="/" 
            className="inline-block w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Return Home
          </Link>
        </div>
      </section>
    )
  }
}