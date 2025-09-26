# Bangladesh National Elections Inquiry Commission Portal

A comprehensive, secure, multilingual Next.js application for the National Elections Inquiry Commission of Bangladesh. This portal enables public participation in electoral oversight through opinion submissions, incident reporting, and transparent access to commission information.

## 🌟 Key Features

### 🌐 **Multilingual Support**
- **Primary Languages**: Bengali (default) and English
- **Easy Expansion**: Add new languages via JSON message files
- **RTL Support**: Ready for Arabic/Urdu if needed
- **Dynamic Content**: All content supports both languages

### 🔐 **Advanced Security**
- **Role-based Access Control**: Admin, Management, Support, and Viewer roles
- **Session Hardening**: Signed JWT sessions with forced logout for deactivated users
- **Security Headers**: Strict CSP with Google reCAPTCHA allow-list, HSTS, X-Frame-Options, COOP/CORP, and more
- **Rate Limiting**: Upstash Redis-backed sliding window throttling for abusive requests plus edge-level middleware guard rails
- **Audit Logging**: Pino-based structured logging for submissions, auth, and administrative actions
- **Input & Upload Validation**: Zod validation everywhere, MIME-sniffing file inspection, size/extension allow-lists, and secure local file uploads
- **Bot Mitigation**: Google reCAPTCHA v2 challenge on public submissions and hidden honeypot fields

### 🏛️ **Public Features**
- **Opinion Submission**: Secure form for public feedback
- **Incident Reporting**: Structured reporting with evidence upload
- **Commission Information**: Members, officials, terms of reference
- **News & Updates**: Blog posts, notices, and announcements
- **Gallery**: Visual documentation of commission activities
- **FAQ Section**: Common questions and answers
- **Contact Information**: Multiple contact channels

### 👨‍💼 **Admin Panel**
- **Dashboard**: Statistics, recent activity, and system health
- **User Management**: Create, edit, and manage system users
- **Content Management**: Blog posts, FAQs, notices, sliders
- **Commission Management**: Members, officials, gazettes, terms
- **Gallery Management**: Upload and organize images
- **Submission Review**: Process and respond to public submissions
- **Audit Logs**: Complete system activity tracking
- **System Settings**: Configuration and maintenance

### 📱 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach with comprehensive responsive layouts
- **Mobile Optimization**: All pages fully responsive across devices (320px to 4K+ screens)
- **Touch-Friendly Interface**: Optimized touch targets and mobile interactions
- **Accessibility**: WCAG 2.1 AA compliant with semantic HTML and proper contrast
- **Performance**: Optimized loading and rendering with static generation
- **Dark/Light Theme**: User preference support with system theme detection
- **Progressive Web App**: Offline capability ready with service worker support

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | Next.js 14 (App Router) | React framework with SSR/SSG |
| **Language** | TypeScript | Type-safe development |
| **Database** | PostgreSQL + Prisma | Production database with ORM |
| **Authentication** | NextAuth.js | Secure session management |
| **Internationalization** | next-intl | Multi-language support |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Validation** | Zod | Schema validation |
| **File Storage** | Local Storage | Secure file uploads |
| **Rate Limiting** | Upstash Redis | Distributed API protection with sliding window |
| **Icons** | Heroicons + Lucide | Consistent iconography |
| **Deployment** | Docker | Containerized deployment |

## 🔐 Security Architecture

This portal is designed for a high-assurance government environment. Key defensive layers include:

- **Authentication & Authorization**: NextAuth.js with Prisma adapter, JWT sessions, enforced role hierarchy, and activity locking for inactive users.
- **Request Protection**: Google reCAPTCHA v2 challenge on public submission endpoints, honeypot fields, sliding-window rate limiting (Upstash Redis + edge middleware), and password-reset throttling.
- **Transport & Browser Security**: Middleware-enforced HSTS, X-Content-Type-Options, X-Frame-Options, COOP/CORP, Permissions-Policy, and a restrictive Content-Security-Policy that only whitelists required Google reCAPTCHA assets.
- **Data & File Safety**: SHA-256 IP hashing, detailed submission/audit logging, secure local file uploads, UUID file naming, MIME signature checking via `file-type`, strict extension allow-list, and configurable size limits (`NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE_MB`).
- **Code Integrity**: Shared Zod schemas, spam heuristics for submissions, Prisma schema-level constraints, and centralized logging for observability.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL (for production)
- Local file storage (uploads stored in uploads/ directory)

### 1. Clone and Install
```bash
git clone <repository-url>
cd election
npm install
```

### 2. Environment Setup
Create a `.env` file:
```bash
# Database
DATABASE_URL="postgresql://election_admin:SecureElectionDB2024!@localhost:5432/election_commission"

# Authentication
NEXTAUTH_SECRET="YourSuperSecretKeyForElectionCommission2024!"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_RECAPTCHA_KEY="your_recaptcha_v2_site_key"
RECAPTCHA_SECRET_KEY="your_recaptcha_v2_secret_key"

# Admin User (for initial setup)
ADMIN_EMAIL="admin@election-commission.gov.bd"
ADMIN_PASSWORD="SecureAdmin2024!"
ADMIN_NAME="System Administrator"

# Upstash Redis (for rate limiting)
KV_URL="rediss://default:your_token@your-instance.upstash.io:6379"
KV_REST_API_URL="https://your-instance.upstash.io"
KV_REST_API_TOKEN="your_rest_api_token"
KV_REST_API_READ_ONLY_TOKEN="your_readonly_token"
REDIS_URL="rediss://default:your_token@your-instance.upstash.io:6379"

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX=10

# File uploads are now stored locally in the uploads/ directory

# Upload constraints
NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE_MB="25"

# Security
POSTGRES_PASSWORD="SecureElectionDB2024!"
```

> ℹ️  Use Google reCAPTCHA **v2 (checkbox or invisible)** keys and list your development/production domains in the reCAPTCHA admin console. The API reads `RECAPTCHA_SECRET_KEY` for verification and will fall back to `NEXT_PUBLIC_RECAPTCHA_KEY_SECRET` if necessary.

### 3. Database Setup
```bash
# Start services with Docker
npm run docker:up

# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed initial data (admin user + sample content)
npm run db:seed
```

### 4. Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
election/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Internationalized routes
│   │   ├── admin/               # Admin panel pages
│   │   │   ├── dashboard/       # Admin dashboard
│   │   │   ├── users/          # User management
│   │   │   ├── submissions/    # Submission review
│   │   │   ├── settings/       # Content management
│   │   │   ├── commission/     # Commission data
│   │   │   ├── gallery/        # Gallery management
│   │   │   ├── audit/          # Audit logs
│   │   │   └── reports/        # Analytics
│   │   ├── blog/               # Public blog
│   │   ├── commission/         # Commission info
│   │   ├── contact/            # Contact page
│   │   ├── faq/                # FAQ page
│   │   ├── gallery/            # Public gallery
│   │   ├── notice/             # Notices
│   │   ├── submit/             # Opinion submission
│   │   ├── reporting/          # Incident reporting
│   │   ├── login/              # Authentication
│   │   └── management/         # Management panel
│   ├── api/                    # API routes
│   │   ├── admin/              # Admin APIs
│   │   ├── auth/               # Authentication
│   │   ├── public/             # Public APIs
│   │   └── submit/             # Submission API
│   └── globals.css             # Global styles
├── components/                  # Reusable components
│   ├── admin/                  # Admin-specific components
│   ├── auth/                   # Authentication components
│   └── ui/                     # General UI components
├── data/                       # Static data files
│   ├── blogData.json           # Blog content
│   ├── notices.json            # Notice data
│   ├── gazettes.json           # Gazette data
│   └── commisson_data.json     # Commission info
├── lib/                        # Utility libraries
│   ├── auth.ts                 # Authentication logic
│   ├── db.ts                   # Database utilities
│   ├── validation/             # Validation schemas
│   ├── security/               # Security utilities
│   └── crypto/                 # Encryption utilities
├── messages/                   # Internationalization
│   ├── en.json                 # English translations
│   └── bn.json                 # Bengali translations
├── prisma/                     # Database schema
│   ├── schema.prisma           # Database models
│   └── migrations/             # Database migrations
├── public/                     # Static assets
│   ├── slider-images/          # Homepage carousel
│   ├── blog-images/            # Blog illustrations
│   └── favicon_io/             # Favicons
├── scripts/                    # Database seeding
│   ├── master-seed.js          # Complete seeding script
│   └── README.md               # Seeding documentation
└── types/                      # TypeScript definitions
```

## 🔐 User Roles & Permissions

### **ADMIN** (Level 3) - Full System Access
- ✅ User management (create, edit, delete, roles)
- ✅ System configuration and settings
- ✅ All content management features
- ✅ Complete audit log access
- ✅ Database operations
- ✅ Security settings

### **MANAGEMENT** (Level 2) - Administrative Operations
- ✅ User management (limited)
- ✅ Content management (blog, FAQ, notices)
- ✅ Submission review and processing
- ✅ Audit log viewing
- ✅ Report generation
- ❌ System configuration

### **SUPPORT** (Level 1) - Content Operations
- ✅ View and respond to submissions
- ✅ Basic content editing
- ✅ FAQ management
- ✅ User support activities
- ❌ User management
- ❌ System settings

### **VIEWER** (Level 0) - Read-Only Access
- ✅ View submissions and reports
- ✅ Access public information
- ❌ Edit any content
- ❌ Administrative functions

## 🎯 Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run typecheck       # TypeScript type checking
```

### Database Operations
```bash
npm run db:migrate      # Run Prisma migrations
npm run db:generate     # Generate Prisma client
npm run db:seed         # Seed database with initial data
npm run db:seed-admin   # Create admin user only
```

### Docker Operations
```bash
npm run docker:up       # Start PostgreSQL and Redis
npm run docker:down     # Stop Docker services
npm run docker:logs     # View service logs
```

### Testing & Quality
```bash
npm run test            # Run Jest tests
npm run test:watch      # Run tests in watch mode
npm run e2e             # Run Playwright e2e tests
npm run e2e:headed      # Run e2e tests with browser
npm run analyze         # Bundle size analysis
```

## 🌐 Internationalization

### Adding New Languages
1. Create message file: `messages/[locale].json`
2. Update `i18n.ts` configuration
3. Add locale to middleware configuration
4. Update navigation data

### Translation Structure
```json
{
  "meta": { "title": "...", "description": "..." },
  "navigation": { "home": "...", "about": "..." },
  "forms": { "submit": "...", "required": "..." },
  "admin": { "dashboard": "...", "users": "..." }
}
```

## 🛡️ Security Features

### Authentication & Authorization
- **Session Management**: Secure JWT-based sessions
- **Password Security**: bcrypt hashing with salt rounds
- **Role-based Access**: Granular permission system
- **Account Protection**: Login attempt limiting
- **Session Timeout**: Automatic logout after inactivity

### Security Headers
```
Content-Security-Policy: strict policy
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Data Protection
- **Input Validation**: Zod schemas on client and server
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Prevention**: React's built-in protection + CSP
- **CSRF Protection**: NextAuth.js CSRF tokens
- **Rate Limiting**: API endpoint protection

### Audit & Monitoring
- **User Actions**: Login, logout, data changes
- **Admin Operations**: User management, system changes
- **Security Events**: Failed logins, permission violations
- **Data Access**: Submission views, exports

## 📊 Database Schema Overview

### Core Models
- **User**: System users with roles and permissions
- **Session**: Active user sessions
- **Submission**: Public opinion submissions
- **SubmissionAttachment**: File attachments
- **AuditLog**: System audit trail
- **UserAuditLog**: User-specific audit logs

### Content Models
- **BlogPost**: News articles and updates
- **FAQ**: Frequently asked questions
- **Notice**: Official announcements
- **Slider**: Homepage carousel content
- **Gallery**: Image gallery items
- **ContactInfo**: Contact information

### Commission Models
- **CommissionMember**: Commission member profiles
- **CommissionOfficial**: Staff and officials
- **CommissionTerm**: Terms of reference
- **Gazette**: Official gazette notifications

## 🚀 Production Deployment

### Docker Deployment
```bash
# Build and start services
docker-compose up -d

# Run migrations
docker exec election_app npm run db:migrate

# Seed initial data
docker exec election_app npm run db:seed
```

### Environment Variables (Production)
```bash
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@db:5432/election_commission"
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://your-domain.gov.bd"
REDIS_URL="redis://redis:6379"
```

### Security Checklist
- [ ] Change all default passwords
- [ ] Configure HTTPS with valid certificates
- [ ] Set up firewall rules (ports 80, 443 only)
- [ ] Enable database SSL connections
- [ ] Configure automated backups
- [ ] Set up monitoring and alerting
- [ ] Test all security headers
- [ ] Verify rate limiting configuration
- [ ] Review audit logging setup
- [ ] Configure log rotation
- [ ] Set up intrusion detection

## 📈 Performance Optimization

### Frontend Optimizations
- **Server Components**: Reduced client-side JavaScript
- **Image Optimization**: Next.js automatic optimization
- **Font Optimization**: Google Fonts with display swap
- **Code Splitting**: Automatic route-based splitting
- **Static Generation**: Pre-built pages where possible

### Database Optimizations
- **Indexing**: Strategic database indexes
- **Connection Pooling**: Prisma connection management
- **Query Optimization**: Efficient database queries
- **Caching**: Redis-based caching strategy

### Monitoring & Analytics
- **Performance Metrics**: Core Web Vitals tracking
- **Error Monitoring**: Comprehensive error logging
- **User Analytics**: Privacy-compliant analytics
- **System Health**: Database and service monitoring

## 🔧 Development Guidelines

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Consistent code formatting
- **Prettier**: Automated code formatting
- **Commit Messages**: Conventional commit format

### Testing Strategy
- **Unit Tests**: Jest for component testing
- **Integration Tests**: API route testing
- **E2E Tests**: Playwright for user flows
- **Accessibility Tests**: axe-core integration

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create pull request
```

## 🆘 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check PostgreSQL status
docker ps | grep postgres

# View database logs
docker logs election_postgres

# Test connection
npm run db:migrate
```

#### Authentication Problems
```bash
# Reset admin password
npm run db:seed-admin

# Clear sessions
# Restart Redis or clear session storage
```

#### File Upload Issues
```bash
# Verify local storage directory
ls -la uploads/
# Review IAM policy and bucket CORS
```

#### Rate Limiting Issues
```bash
# Check Upstash Redis connection
curl -H "Authorization: Bearer $KV_REST_API_TOKEN" $KV_REST_API_URL/ping

# Verify rate limiting configuration
echo "Rate limit window: $RATE_LIMIT_WINDOW_SECONDS seconds"
echo "Rate limit max: $RATE_LIMIT_MAX requests"

# Test rate limiting in development
# Rate limiting is disabled in development mode (NODE_ENV=development)
```

### Log Analysis
```bash
# Application logs
docker logs election_app

# Database logs
docker logs election_postgres

# Redis logs
docker logs election_redis

# Combined logs
docker-compose logs -f
```

## 📞 Support & Contact

### Technical Support
- **Email**: admin@election-commission.gov.bd
- **Documentation**: See `/scripts/README.md` for detailed setup
- **Issues**: Create GitHub issues for bug reports

### Security Concerns
- **Report vulnerabilities**: security@election-commission.gov.bd
- **Emergency contact**: Follow incident response procedures
- **Audit requests**: Contact system administrator

## 📄 License

Government project for the National Elections Inquiry Commission of Bangladesh. All rights reserved. This software is for official government use only.

---

## 🎯 Project Status

✅ **Completed Features**
- Multi-language support (Bengali/English)
- Complete admin panel with role-based access
- Public submission system with file uploads
- Commission information management
- Blog and content management system
- Gallery with local file storage
- Comprehensive audit logging
- Docker deployment setup
- Database seeding system
- **Full mobile responsiveness across all pages**
- **Production-ready rate limiting with Upstash Redis**

🚧 **In Development**
- Advanced analytics dashboard
- Email notification system
- Mobile app API endpoints
- Advanced search functionality

📋 **Planned Features**
- Multi-factor authentication
- Advanced reporting tools
- Integration with government SSO
- Mobile applications
- Public API for transparency

---

## 🆕 Recent Updates & Improvements

### 📱 **Mobile Responsiveness Overhaul** *(Latest)*
- **Complete Mobile Optimization**: All pages now fully responsive across devices (320px to 4K+ screens)
- **Touch-Friendly Interface**: Optimized touch targets, spacing, and mobile interactions
- **Responsive Components**: Updated all major components for mobile-first design:
  - Commission pages (members, officials, terms, gazettes)
  - Public pages (submit, notice, reporting, blog, gallery, contact)
  - Admin interface and dashboard
  - Error pages (rate-limit, 404, 500)
- **Enhanced Typography**: Responsive text scaling and improved readability
- **Mobile Navigation**: Improved mobile menu and navigation experience
- **Grid Layouts**: Adaptive grid systems that work across all screen sizes
- **Button Optimization**: Full-width buttons on mobile with proper touch targets

### ⚡ **Rate Limiting System Upgrade** *(Latest)*
- **Production-Ready**: Upgraded to use Upstash Redis for distributed rate limiting
- **Sliding Window**: Implemented sliding window rate limiting (10 requests per 60 seconds)
- **High Availability**: Distributed rate limiting across multiple server instances
- **Fallback System**: Graceful degradation to in-memory rate limiting if Redis fails
- **Environment Configuration**: Updated to use standard KV environment variables
- **Error Handling**: Enhanced error handling and user feedback for rate limit scenarios

### 🎨 **UI/UX Enhancements**
- **Z-Index Management**: Fixed overlapping issues between mobile menu and slider
- **Component Consistency**: Standardized responsive patterns across all components
- **Loading States**: Enhanced loading and error states for better user experience
- **Accessibility**: Improved screen reader support and keyboard navigation
- **Dark Mode**: Enhanced dark mode support across all responsive breakpoints

### 🔧 **Technical Improvements**
- **CSS Optimization**: Cleaned up redundant and conflicting CSS classes
- **Performance**: Optimized component rendering and layout calculations
- **Code Quality**: Eliminated linting errors and improved code maintainability
- **Type Safety**: Enhanced TypeScript types for responsive props and configurations

---

**⚠️ Security Notice**: This is a government system handling sensitive electoral data. All access is logged and monitored. Unauthorized access is prohibited and may result in legal action under Bangladesh Cyber Security Act.

**🏛️ Official Use**: This portal is operated by the National Elections Inquiry Commission of Bangladesh for collecting public opinions and incident reports related to national elections.
