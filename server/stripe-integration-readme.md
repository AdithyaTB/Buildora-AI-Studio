# Stripe Payment Gateway Integration Documentation

This document explains the integration of the secure, production-ready Stripe Payment Gateway in Buildora.

---

## 🔑 Environment Variables Setup

### Backend Environment (`server/.env`)
Add these keys to your backend `.env` configuration:
```env
# Stripe Secrets
STRIPE_SECRET_KEY="sk_test_..."          # Obtain from Stripe Dashboard (Developers > API Keys)
STRIPE_WEBHOOK_SECRET="whsec_..."        # Generate via Stripe CLI or Stripe Webhook Dashboard
```

### Frontend Environment (`client/.env`)
Add this key to your client `.env` configuration:
```env
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..." # Obtain from Stripe Dashboard (Developers > API Keys)
```

---

## 🗄️ Database Schemas

### 1. Payment Model (`models/Payment.js`)
Stores checkout session states, payment statuses, billing methods, and receipts.
* **Indexed fields**: `userId`, `paymentStatus` (for fast lookups, analytics, and lists).
* **Properties**:
  * `userId`: `ObjectId` (Ref: `User`, Required)
  * `amount`: `Number` (Required)
  * `currency`: `String` (Required, Default: `'usd'`)
  * `paymentIntentId`: `String` (Unique, Sparse)
  * `transactionId`: `String` (Charge/Stripe transaction reference ID)
  * `paymentMethod`: `String` (e.g., `'card'`)
  * `paymentStatus`: `String` (`'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded'`)
  * `orderReference`: `String` (Prefix `'ORD-'` + Timestamp)
  * `receiptUrl`: `String` (Direct secure invoice URL on Stripe domain)

### 2. User Model Update (`models/User.js`)
* Added `role`: `String` (`enum: ['user', 'admin']`, default: `'user'`). This protects administrative and refund resources.

---

## 📡 API Endpoints Reference

All endpoints (except raw Webhooks) are protected with JWT JWT tokens (`Bearer <token>`).

### 1. Checkout & Intents

#### `POST /api/payments/create-payment-intent`
* **Access**: Private
* **Payload**:
  ```json
  { "planType": "pro-monthly" }
  ```
* **Response**: `201 Created`
  ```json
  {
    "clientSecret": "pi_3MtwL2LkdIwHu7ix_secret_xxx",
    "payment": { ... }
  }
  ```

#### `POST /api/payments/verify`
* **Access**: Private
* **Payload**:
  ```json
  { "paymentIntentId": "pi_3MtwL2LkdIwHu7ix" }
  ```
* **Response**: `200 OK`
  ```json
  {
    "status": "succeeded",
    "payment": { ... }
  }
  ```

---

### 2. User Billing History

#### `GET /api/payments/history`
* **Access**: Private
* **Query Parameters**:
  * `page`: `Number` (Default: `1`)
  * `limit`: `Number` (Default: `10`)
  * `search`: `String` (Search by Transaction ID or Reference)
  * `status`: `String` (Filter by payment status)
* **Response**: `200 OK`
  ```json
  {
    "payments": [ ... ],
    "total": 12,
    "page": 1,
    "pages": 2
  }
  ```

#### `GET /api/payments/:id`
* **Access**: Private (Owner or Admin only)
* **Response**: `200 OK`
  ```json
  { ...paymentDetails... }
  ```

---

### 3. Administrative Resources (Admin Role Required)

#### `POST /api/payments/refund`
* **Access**: Private (Admin Only)
* **Payload**:
  ```json
  { "paymentIntentId": "pi_3MtwL2LkdIwHu7ix" }
  ```
* **Response**: `200 OK`
  ```json
  {
    "message": "Payment refunded successfully",
    "refund": { ... },
    "payment": { ... }
  }
  ```

#### `GET /api/payments/admin/stats`
* **Access**: Private (Admin Only)
* **Response**: `200 OK`
  ```json
  {
    "totalRevenue": 4999.00,
    "successfulPayments": 5,
    "failedPayments": 2,
    "refundCount": 1,
    "monthlyRevenue": [ { "month": "2026-07", "revenue": 4999.00 } ],
    "recentTransactions": [ ... ]
  }
  ```

---

### 4. Stripe Webhooks

#### `POST /api/payments/webhook`
* **Access**: Public (Signature Verified)
* **Headers**: `stripe-signature` must be passed by Stripe.
* **Payload**: Raw request body (`express.raw`).
* **Verifies event signature using**: `STRIPE_WEBHOOK_SECRET`
* **Monitored Events**:
  * `payment_intent.succeeded` -> Marks payment completed, credits user account.
  * `payment_intent.payment_failed` -> Marks payment as failed.
  * `payment_intent.canceled` -> Marks payment as failed.
  * `charge.refunded` -> Reverts payment to refunded in DB, adjusts user credits.
  * `checkout.session.completed` -> Alternative checkout fulfillment check.

---

## 🛠️ Testing Setup

### 1. Stripe Test Cards
You can test payments using the following cards (valid in Test Mode):
* **Standard Success**: `4242 4242 4242 4242`
* **Any Expiry Date**: `12/28` (or future date)
* **Any CVV**: `123`
* **Any ZIP**: `90210`

### 2. Local Webhook Testing using Stripe CLI
1. [Download Stripe CLI](https://stripe.com/docs/stripe-cli) and login:
   ```bash
   stripe login
   ```
2. Forward events to your local server port (typically 5001):
   ```bash
   stripe listen --forward-to localhost:5001/api/payments/webhook
   ```
3. Copy the output webhook secret (`whsec_...`) and save it to your `STRIPE_WEBHOOK_SECRET` in `server/.env`.
4. Trigger test events in another terminal window:
   ```bash
   stripe trigger payment_intent.succeeded
   stripe trigger charge.refunded
   ```

---

## 🚀 Production Deployment Instructions

1. **Stripe Dashboard Settings**:
   * Switch your Stripe account to **Live Mode**.
   * Copy the Live Publishable Key and Live Secret Key.
   * Go to **Developers > Webhooks**, select **Add Endpoint**, set endpoint URL to `https://yourdomain.com/api/payments/webhook`, and register the events `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, `charge.refunded`, and `checkout.session.completed`.
2. **Environment Configuration**:
   * Ensure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are securely loaded onto your production environment variables hosting provider (like Heroku, AWS ECS, or Render).
   * Inject `VITE_STRIPE_PUBLISHABLE_KEY` during the frontend build step.
3. **Database Indexing**:
   * Confirm database indexes are successfully built on startup to optimize transaction search history queries.
