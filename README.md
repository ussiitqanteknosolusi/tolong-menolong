# BerbagiPath - Platform Donasi & Crowdfunding Indonesia

Platform donasi online terpercaya untuk membantu sesama, mirip dengan Kitabisa.com.

## Features

### Implemented ✅
- **Responsive Navigation**: Desktop top nav + Mobile bottom nav
- **Homepage**: Hero slider, stats, categories, campaign listings
- **Campaign Detail**: Story, progress bar, donor list, sticky donate button
- **Donation Flow**: Full flow with Xendit payment gateway integration
- **Payment Methods**: QRIS, Virtual Account (BCA, Mandiri, BRI), E-wallets (OVO, DANA, LinkAja, ShopeePay)
- **Webhook Handler**: Auto-update donation status
- **Animations**: Framer Motion for smooth transitions

### Tech Stack
- **Frontend**: Next.js 14, React, Tailwind CSS, shadcn/ui
- **Payment**: Xendit Payment Gateway
- **Database**: MySQL (schema provided)
- **Animations**: Framer Motion

## Getting Started

### 1. Environment Variables

Create `.env` file:

```env
# Xendit Payment Gateway
XENDIT_SECRET_KEY=xnd_development_xxxxx
XENDIT_CALLBACK_TOKEN=your_callback_token

# MySQL Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=db_tolongmenolong
MYSQL_USER=root
MYSQL_PASSWORD=

# App URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Database Setup

Import the SQL schema to your MySQL database:

```bash
mysql -u root -p < database/schema.sql
```

Or run in phpMyAdmin:
1. Open phpMyAdmin
2. Create database `db_tolongmenolong`
3. Import file `database/schema.sql`

### 3. Install Dependencies

```bash
yarn install
```

### 4. Run Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/:id` - Get campaign by ID
- `POST /api/campaigns` - Create new campaign

### Donations
- `POST /api/donations` - Create donation (returns Xendit invoice URL)
- `GET /api/donations/:id` - Get donation by ID
- `GET /api/donations/campaign/:id` - Get donations for a campaign

### Payment
- `GET /api/payment/status/:invoiceId` - Check payment status
- `POST /api/webhook/xendit` - Xendit webhook handler

## Xendit Integration

### Payment Flow
1. User submits donation form
2. Backend creates Xendit Invoice
3. User redirected to Xendit checkout page
4. User selects payment method (QRIS/VA/E-wallet)
5. User completes payment
6. Xendit sends webhook callback
7. Backend updates donation status

### Webhook Setup
Configure webhook URL in Xendit Dashboard:
```
https://your-domain.com/api/webhook/xendit
```

### Test Mode
Using test API key (`xnd_development_*`), payments are simulated and no real money is charged.

## Database Schema

### Tables
- `users` - User accounts
- `categories` - Campaign categories
- `campaigns` - Fundraising campaigns
- `donations` - Donation transactions
- `campaign_updates` - Campaign progress updates
- `notifications` - User notifications
- `webhook_logs` - Xendit webhook logs
- `processed_webhooks` - Idempotency tracking

### Key Fields in `donations`
- `xendit_invoice_id` - Xendit invoice reference
- `xendit_external_id` - Our external ID (DON-XXXXXXXX)
- `status` - pending, paid, failed, expired
- `payment_method` - QRIS, VIRTUAL_ACCOUNT, EWALLET
- `payment_channel` - BCA, MANDIRI, OVO, DANA, etc.

## Project Structure

```
/app
├── app/
│   ├── api/[[...path]]/route.js  # API routes
│   ├── campaign/[slug]/page.js    # Campaign detail
│   ├── donations/page.js          # My donations
│   ├── inbox/page.js              # Notifications
│   ├── payment/
│   │   ├── success/page.js        # Payment success
│   │   └── failed/page.js         # Payment failed
│   ├── profile/page.js            # User profile
│   ├── page.js                    # Homepage
│   └── layout.js                  # Root layout
├── components/
│   ├── ui/                        # shadcn components
│   ├── campaign-card.jsx
│   ├── category-grid.jsx
│   ├── desktop-nav.jsx
│   ├── donation-modal.jsx
│   ├── hero-section.jsx
│   └── mobile-nav.jsx
├── database/
│   └── schema.sql                 # MySQL schema
├── lib/
│   ├── db.js                      # MySQL connection
│   ├── mock-data.js               # Sample data
│   ├── utils.js                   # Utilities
│   └── xendit.js                  # Xendit SDK
└── .env                           # Environment variables
```

## Xendit API Reference

### Create Invoice
```javascript
const result = await xendit.createInvoice({
  externalId: 'DON-12345678',
  amount: 50000,
  payerEmail: 'donor@email.com',
  description: 'Donasi untuk Campaign XYZ',
  successRedirectUrl: 'https://domain.com/payment/success',
  failureRedirectUrl: 'https://domain.com/payment/failed',
  customerName: 'Donor Name',
  customerPhone: '08123456789',
});
```

### Webhook Payload (Invoice Paid)
```json
{
  "id": "invoice_id",
  "external_id": "DON-12345678",
  "status": "PAID",
  "amount": 50000,
  "paid_amount": 50000,
  "paid_at": "2025-01-01T00:00:00.000Z",
  "payment_method": "VIRTUAL_ACCOUNT",
  "payment_channel": "BCA"
}
```

## License

MIT
