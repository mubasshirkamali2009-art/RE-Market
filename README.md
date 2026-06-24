# ReMarket

A second-hand marketplace platform where users can buy and sell pre-owned products safely and efficiently.

## 🎯 Project Purpose

ReMarket helps reduce waste and promote sustainable consumption by giving people a platform to sell products they no longer need, while helping buyers find quality items at affordable prices. Sellers can list pre-owned products, buyers can browse, search, and purchase securely, and the platform supports the full flow from listing to checkout.

## 🔗 Live URL

[https://re-market-three.vercel.app/](https://re-market-three.vercel.app/)

## ✨ Key Features

- **User Authentication** — Secure sign up and login powered by Better Auth
- **Product Listings** — Sellers can create, edit, and manage product listings with images, descriptions, condition, and price
- **Search & Filter** — Buyers can search and filter products to quickly find what they're looking for
- **Cart & Checkout** — Full cart management with a secure checkout flow
- **Secure Payments** — Stripe integration for safe and reliable online payments
- **Animated UI** — Smooth, polished interactions using Framer Motion
- **Responsive Design** — Built with Tailwind CSS, HeroUI, and DaisyUI for a clean experience across devices
- **Data Visualization** — Recharts-powered charts for dashboard insights

## 🛠️ Tech Stack

**Frontend:** Next.js
**Backend:** Express.js
**Database:** MongoDB (Mongoose)
**Authentication:** Better Auth

## 📦 NPM Packages Used

| Package | Purpose |
|---|---|
| `next` | React framework for the frontend |
| `express` | Backend server framework |
| `mongoose` | MongoDB object modeling |
| `better-auth` | Authentication system |
| `stripe` | Payment processing |
| `tailwindcss` | Utility-first CSS styling |
| `daisyui` | Tailwind CSS component library |
| `@heroui/react` | UI component library |
| `framer-motion` | Animations and transitions |
| `recharts` | Charts and data visualization |

> Update this table with exact versions from your `package.json` files (client and server) before final submission.

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- MongoDB connection string
- Stripe API keys
- Better Auth configuration keys

### Environment Variables
Create a `.env` file in both the client and server directories with the required keys (MongoDB URI, Better Auth secret, Stripe keys, etc.). **Never commit your `.env` file.**

### Installation

```bash
# Client
cd client
npm install
npm run dev

# Server
cd server
npm install
npm run dev
```

## 📄 License

This project is for educational/assignment purposes.