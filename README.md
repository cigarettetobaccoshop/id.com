# id.com - Complete Supabase + Next.js Full-Stack Application

🚀 **Production-Ready Web Application with Real-time Database, OAuth, Storage, and Analytics**

[![JavaScript](https://img.shields.io/badge/JavaScript-51.8%25-yellow)](https://javascript.com)
[![HTML](https://img.shields.io/badge/HTML-25.3%25-red)](https://html.spec.whatwg.org)
[![CSS](https://img.shields.io/badge/CSS-22.1%25-blue)](https://www.w3.org/Style/CSS/)
[![TypeScript](https://img.shields.io/badge/TypeScript-0.8%25-blue)](https://www.typescriptlang.org)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Demo Pages](#-demo-pages)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### Step 1: Real-time Database Integration
✅ PostgreSQL with Supabase
✅ Real-time subscriptions (WebSocket)
✅ CRUD operations with RLS policies
✅ Todo application demo
✅ Live multi-tab sync

### Step 2: OAuth Authentication
✅ Google OAuth 2.0
✅ GitHub OAuth integration
✅ Session management
✅ Role-based access control
✅ Secure authentication flow

### Step 3: File Storage Management
✅ Image upload/download
✅ Public and private buckets
✅ File validation
✅ Automatic CDN caching
✅ Storage demo with UI

### Step 4: Analytics & Performance
✅ Google Analytics integration
✅ Core Web Vitals tracking
✅ Custom event tracking
✅ Performance metrics
✅ User behavior analysis

### Step 5: Optimization
✅ Response caching
✅ Debounce/throttle utilities
✅ Lazy image loading
✅ Code splitting
✅ Bundle size optimization

## 🛠 Tech Stack

**Frontend:**
- [Next.js](https://nextjs.org) - React framework
- [React](https://react.dev) - UI library
- [CSS3](https://www.w3.org/Style/CSS/) - Styling

**Backend & Services:**
- [Supabase](https://supabase.com) - PostgreSQL + Auth + Storage
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth](https://docs.github.com/en/developers/apps)

**Analytics & Monitoring:**
- [Google Analytics 4](https://analytics.google.com)
- [Vercel Analytics](https://vercel.com/analytics)
- [Core Web Vitals](https://web.dev/vitals/)

**Deployment:**
- [Vercel](https://vercel.com) - Hosting & CI/CD
- [GitHub](https://github.com) - Version control

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ ([Download](https://nodejs.org))
- Git ([Download](https://git-scm.com))
- Supabase account ([Create](https://supabase.com))
- Google OAuth credentials ([Setup](https://console.cloud.google.com))

### Installation

```bash
# Clone repository
git clone https://github.com/cigarettetobaccoshop/id.com.git
cd id.com

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your credentials to .env.local
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# NEXT_PUBLIC_GA_MEASUREMENT_ID=...

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

### First Steps

1. **Setup Supabase:**
   - Create Supabase project
   - Get API keys from Settings
   - Configure OAuth providers

2. **Configure Environment:**
   - Copy `.env.example` to `.env.local`
   - Add Supabase credentials
   - Add Google Analytics ID

3. **Test Features:**
   - Visit http://localhost:3000/auth - Test OAuth
   - Visit http://localhost:3000/realtime-demo - Test Real-time
   - Visit http://localhost:3000/storage-demo - Test Storage
   - Visit http://localhost:3000/analytics-demo - Test Analytics

## 📁 Project Structure

```
id.com/
├── pages/                          # Next.js pages
│   ├── _app.js                    # App wrapper with providers
│   ├── index.js                   # Home page
│   ├── auth.js                    # OAuth demo
│   ├── realtime-demo.js           # Real-time database demo
│   ├── storage-demo.js            # File storage demo
│   └── analytics-demo.js          # Analytics & optimization demo
│
├── lib/                           # Utility functions
│   ├── supabaseClient.js          # Supabase client
│   ├── supabaseRealtimeClient.js  # Real-time client
│   ├── supabaseOAuth.js           # OAuth utilities
│   ├── supabaseStorage.js         # Storage utilities
│   ├── analytics.js               # Analytics utilities
│   └── optimization.js            # Optimization utilities
│
├── components/                    # Reusable components
│   ├── Navbar.js                  # Navigation
│   ├── Footer.js                  # Footer
│   └── AuthGuard.js               # Protected routes
│
├── styles/                        # Global styles
│   └── globals.css
│
├���─ docs/                          # Documentation
│   ├── SETUP.md                   # Setup guide
│   ├── REALTIME.md                # Real-time guide
│   ├── OAUTH.md                   # OAuth guide
│   ├── STORAGE.md                 # Storage guide
│   ├── ANALYTICS.md               # Analytics guide
│   └── INTEGRATION.md             # Integration guide
│
├── public/                        # Static assets
├── .env.example                   # Environment template
├── .gitignore
├── next.config.js                 # Next.js config
├── package.json
└── README.md
```

## 📚 Documentation

Detailed guides for each feature:

| Step | Feature | Documentation |
|------|---------|---|
| 1 | Real-time Database | [docs/REALTIME.md](docs/REALTIME.md) |
| 2 | OAuth Authentication | [docs/OAUTH.md](docs/OAUTH.md) |
| 3 | File Storage | [docs/STORAGE.md](docs/STORAGE.md) |
| 4 | Analytics | [docs/ANALYTICS.md](docs/ANALYTICS.md) |
| 5 | Integration | [docs/INTEGRATION.md](docs/INTEGRATION.md) |

## 🎯 Demo Pages

### 1. Real-time Demo
**URL:** `http://localhost:3000/realtime-demo`

Features:
- Create, read, update, delete todos
- Real-time sync across browser tabs
- Live user presence
- Instant updates

### 2. OAuth Demo
**URL:** `http://localhost:3000/auth`

Features:
- Sign in with Google
- Sign in with GitHub
- User session display
- Logout functionality

### 3. Storage Demo
**URL:** `http://localhost:3000/storage-demo`

Features:
- Upload images
- Display uploaded files
- Delete files
- Public URL generation

### 4. Analytics Demo
**URL:** `http://localhost:3000/analytics-demo`

Features:
- Track page views
- Track custom events
- Performance metrics
- Memory usage monitoring

## 📊 Performance Metrics

Target performance:
- ⚡ **LCP:** < 2.5 seconds
- ⚡ **FID:** < 100 milliseconds
- ⚡ **CLS:** < 0.1
- ⚡ **PageSpeed Score:** > 90

Check your metrics:
```bash
# Run Lighthouse audit
npm run lighthouse

# Or visit: https://pagespeed.web.dev
```

## 🔒 Security Features

✅ Row Level Security (RLS) policies
✅ OAuth 2.0 authentication
✅ Environment variable protection
✅ CORS configuration
✅ Input validation
✅ Secure session management
✅ HTTPS enforcement (production)

## 📈 Google Analytics Setup

1. Create property at [analytics.google.com](https://analytics.google.com)
2. Get Measurement ID (format: `G-XXXXXXXXXX`)
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
4. Track events automatically via `lib/analytics.js`
5. View real-time events in GA Dashboard

## 🚀 Deployment

### Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Deploy to Vercel"
git push origin main

# Import in Vercel Dashboard
# - Connect GitHub repository
# - Add environment variables
# - Click Deploy
```

### Environment Variables (Production)

Add these in Vercel Dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_GA_MEASUREMENT_ID=...
NEXT_PUBLIC_APP_URL=https://id.com
```

### Custom Domain

1. Add domain in Vercel Dashboard
2. Update DNS records
3. Configure Supabase redirect URLs

## 🧪 Testing

```bash
# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start

# Analyze bundle
ANALYZE=true npm run build
```

## 📝 API Reference

See [docs/INTEGRATION.md](docs/INTEGRATION.md) for complete API reference.

### Key Endpoints

```
Authentication:
  POST   /api/auth/signin
  POST   /api/auth/signout
  GET    /api/auth/user

Real-time:
  GET    /api/todos
  POST   /api/todos
  PUT    /api/todos/:id
  DELETE /api/todos/:id

Storage:
  POST   /api/upload
  GET    /api/files
  DELETE /api/files/:id

Analytics:
  POST   /api/analytics/track
  GET    /api/analytics/dashboard
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙋 Support

- 📚 [Full Documentation](docs/)
- 💬 [GitHub Issues](https://github.com/cigarettetobaccoshop/id.com/issues)
- 📧 [Email Support](mailto:cigaratetobacoshop@gmail.com)

## 🎉 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [Vercel](https://vercel.com) - Hosting and deployment
- [Next.js](https://nextjs.org) - React framework
- [Google Cloud](https://cloud.google.com) - OAuth & Analytics

## 📞 Contact

- **Repository:** [cigarettetobaccoshop/id.com](https://github.com/cigarettetobaccoshop/id.com)
- **Email:** cigaratetobacoshop@gmail.com
- **Website:** https://id.com

---

**Made with ❤️ by [cigarettetobaccoshop](https://github.com/cigarettetobaccoshop)**

⭐ Star this project if you find it helpful!
