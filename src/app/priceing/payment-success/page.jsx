import { stripe } from '@/lib/stripe'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  CreditCard,
  Store,
  Mail,
  User,
  Calendar,
  MapPin,
  BadgeCheck,
} from 'lucide-react'

function formatPrice(n) {
  return `৳ ${Number(n || 0).toLocaleString("en-US")}`;
}

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
    const productName = session.metadata?.name;
    const customerEmail = session.customer_details?.email || session.metadata?.userEmail;
    const meta = session.metadata || {};

    // ─── 🛠️ FIXED ENVIRONMENT VARIABLE STRING ASSIGNMENT ───
    const apiBase = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

    // ── NEW: fetch product + seller details for display ──
    let product = null;
    if (meta.productId) {
      try {
        const productRes = await fetch(`${apiBase}/api/products/${meta.productId}`);
        if (productRes.ok) {
          product = await productRes.json();
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
      }
    }
    // ── END NEW ──

    try {
      // Step 1: Save the payment history snapshot record
      console.log("hello")
      const paymentResponse = await fetch(`${apiBase}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stripeSessionId: session.id,
          paymentIntentId: session.payment_intent?.id,
          paymentStatus: session.payment_status,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency,
          customerEmail,
          metadata: meta,
        }),
      });
      console.log(paymentResponse)
   
      if (meta.productId) {
        await fetch(`${apiBase}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyerInfo: {
              email: customerEmail,
              id: meta.userId || ""
            },
            productId: meta.productId,
            paymentStatus: 'paid', // Mark as paid since checkout successfully validated
            quantity: 1
          })
        });
      }
    } catch (dbError) {
      // Backend transaction logged error logging (Component safely remains functional)
      console.error("Database structural sync failed on page landing:", dbError);
    }

    // ── NEW: derived display values ──
    const productImage =
      Array.isArray(product?.images) && product.images.length > 0
        ? product.images[0]
        : "/placeholder-product.png";
    const seller = product?.sellerInfo || {};
    const paidAmount = (session.amount_total || 0) / 100;
    const transactionId = session.payment_intent?.id || session.id;
    const paidAt = session.payment_intent?.created
      ? new Date(session.payment_intent.created * 1000)
      : new Date();
    // ── END NEW ──

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

          {/* ── NEW: product, seller, and payment detail cards ── */}
          <div className="text-left space-y-4 mb-6">

            {/* Product */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Product
              </p>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                  <img
                    src={productImage}
                    alt={product?.name || productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  {product?.category && (
                    <p className="text-xs font-medium text-green-600 mb-0.5">{product.category}</p>
                  )}
                  <p className="text-sm font-semibold text-gray-900 leading-snug truncate">
                    {product?.name || productName}
                  </p>
                  <p className="text-base font-bold text-gray-900 mt-1">
                    {formatPrice(paidAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Seller */}
            {(seller.name || seller.email) && (
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Seller
                </p>
                <div className="space-y-2.5">
                  {seller.name && <DetailRow icon={Store} label="Name" value={seller.name} />}
                  {seller.email && <DetailRow icon={Mail} label="Email" value={seller.email} />}
                  {seller.location && <DetailRow icon={MapPin} label="Location" value={seller.location} />}
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Payment Details
              </p>
              <div className="space-y-2.5">
                <DetailRow icon={User} label="Buyer" value={customerEmail} />
                <DetailRow
                  icon={CreditCard}
                  label="Amount Paid"
                  value={formatPrice(paidAmount)}
                  valueClass="font-bold text-gray-900"
                />
                <DetailRow
                  icon={BadgeCheck}
                  label="Status"
                  value={session.payment_status}
                  valueClass="text-green-600 font-semibold capitalize"
                />
                <DetailRow
                  icon={Calendar}
                  label="Date"
                  value={paidAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                />
                <div className="pt-2.5 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400">
                    Transaction ID:{" "}
                    <span className="font-mono text-gray-600 text-[11px] break-all">
                      {transactionId}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* ── END NEW ── */}

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

function DetailRow({ icon: Icon, label, value, valueClass = "text-gray-700" }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-6 h-6 rounded-md bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-gray-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-400">{label}</p>
        <p className={`text-xs leading-snug break-words ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}