# 💳 Payments — Razorpay Integration

ParkEase uses **Razorpay** for booking payments. The full flow is already wired:

```
client: Book → POST /api/bookings (pending)
            → POST /api/payments/create-order  (Razorpay order)
            → Razorpay Checkout (UPI / cards / wallets / netbanking)
            → POST /api/payments/verify        (HMAC signature check) → booking CONFIRMED
server: POST /api/payments/webhook             (source of truth; confirms even if the tab closes)
cancel: PUT /api/bookings/:id/cancel           → Razorpay refund + spot released
```

> **Mock mode:** With no keys configured the flow still works end-to-end using a
> mock order/verify, so you can develop without an account. Add keys to switch to
> real (test-mode) Razorpay Checkout automatically.

---

## 1. Get test API keys (free, 2 minutes)

1. Create an account at **https://razorpay.com** and open the **Dashboard**.
2. Toggle **Test Mode** (switch at the top — test keys are prefixed `rzp_test_`).
3. Go to **Settings → API Keys → Generate Test Key**.
4. Copy the **Key Id** and **Key Secret**.

## 2. Add them to the server env

In `server/.env`:

```bash
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
# optional but recommended (see step 4)
RAZORPAY_WEBHOOK_SECRET=whsec_choose_a_strong_secret
```

Restart the server. The client needs nothing extra — `create-order` returns the
public `keyId`, and the booking page automatically launches real Checkout instead
of the mock flow.

## 3. Test a payment

On the booking page, pay with Razorpay **test credentials** (no real money):

| Method | Test value |
|---|---|
| Card | `4111 1111 1111 1111`, any future expiry, any CVV, any name |
| UPI (success) | `success@razorpay` |
| UPI (failure) | `failure@razorpay` |

A successful payment verifies the signature and confirms the booking (with QR code).
A dismissed/failed payment keeps the booking **pending** under *My Bookings* so it can be retried.

## 4. Webhook (recommended for reliability)

The webhook is the **source of truth** — it confirms the booking even if the user
closes the tab before the client verify call runs.

1. **Settings → Webhooks → Add New Webhook**.
2. **URL**: `https://<your-domain>/api/payments/webhook`
   - Local testing: expose your server with a tunnel, e.g. `ngrok http 5000`, and
     use the generated HTTPS URL + `/api/payments/webhook`.
3. **Secret**: the same value you set as `RAZORPAY_WEBHOOK_SECRET`.
4. **Active events**: `payment.captured`, `payment.failed`, `refund.processed`.

The endpoint verifies the `x-razorpay-signature` header against the raw body using
that secret, then updates the `Payment` and confirms the booking idempotently.

## 5. Refunds

Cancelling a **paid** booking (`PUT /api/bookings/:id/cancel`) automatically issues
a Razorpay refund for the amount, marks the payment `refunded`, and releases the
parking spot. In mock mode the refund is simulated.

---

## Going live (production)

- Complete Razorpay **KYC/activation** to get live keys (`rzp_live_…`).
- Swap the test keys for live keys in the production env; never commit secrets.
- Point the webhook at your production URL with a production webhook secret.
- Keep `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` server-side only — the
  client only ever receives the public `keyId`.
