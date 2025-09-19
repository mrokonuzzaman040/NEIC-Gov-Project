# Database Seeding Scripts

This directory contains scripts for seeding the election commission database with initial data.

## Master Seed Script

The `master-seed.js` file is a comprehensive seeding script that combines all functionality from the individual seed files:

### Features

- **Admin User Creation**: Creates system administrator with secure defaults
- **Content Seeding**: Seeds all website content including:
  - Sliders for homepage carousel
  - Blog posts
  - FAQ entries
  - Notices and announcements
  - Contact information
- **Commission Data**: Seeds commission-specific data:
  - Commission members
  - Commission officials
  - Commission terms and mandates
  - Official gazettes
  - Gallery items

### Usage

```bash
# Run the complete seeding process
node scripts/master-seed.js

# Or from the project root
npm run seed
```

### Environment Variables

You can customize the admin user creation by setting these environment variables:

```bash
export ADMIN_EMAIL="your-admin@domain.com"
export ADMIN_PASSWORD="YourSecurePassword123!"
export ADMIN_NAME="Your Admin Name"
```

If not set, the script uses these defaults:
- Email: `admin@election-commission.gov.bd`
- Password: `SecureAdmin2024!`
- Name: `System Administrator`

### What Gets Seeded

The script seeds the following data:

| Data Type | Count | Description |
|-----------|--------|-------------|
| Users | 1+ | Admin user and any existing users |
| Sliders | 5 | Homepage carousel slides |
| Blog Posts | 6+ | From `data/blogData.json` |
| FAQs | 5 | Frequently asked questions |
| Notices | 10+ | From `data/notices.json` |
| Contacts | 1+ | From `data/contact_info.json` |
| Commission Members | 5+ | From `data/commisson_data.json` |
| Commission Officials | 3+ | From `data/commisson/commission_officials.json` |
| Commission Terms | 4 | Terms of reference |
| Gazettes | 10+ | From `data/gazettes.json` |
| Gallery Items | 2 | Sample gallery entries |

### Security Notes

⚠️ **IMPORTANT**: After running the seed script:

1. **Change the default admin password** immediately after first login
2. The default password is displayed in the console output
3. Admin credentials are logged to the audit system

### Individual Scripts (Legacy)

The following individual scripts are still available but **deprecated** in favor of the master seed:

- `create-admin.js` - Creates admin user only
- `seed-sliders.js` - Seeds slider data only  
- `seed-all-data.js` - Seeds content data only

### Error Handling

The master seed script includes comprehensive error handling:

- Validates password strength (minimum 12 characters)
- Handles existing data gracefully with upsert operations
- Provides detailed logging and progress indicators
- Shows execution time and final statistics
- Exits with proper error codes on failure

### Database Requirements

Ensure your database is properly set up with:

- Prisma schema migrations applied
- Database connection configured in `.env`
- Required data files present in the `data/` directory

### Example Output

```
🌱 Starting comprehensive database seeding...

=== STEP 1: USER MANAGEMENT ===
👨‍💼 Creating admin user...
✅ Admin user created successfully!

=== STEP 2: CONTENT DATA ===
🖼️ Seeding sliders...
✅ Created 5 sliders
📝 Seeding blog data...
✅ Seeded 6 blog posts
...

🎉 Complete database seeding finished successfully!
⏱️ Total seeding time: 0.13 seconds

📊 Database Summary:
📈 Total Records Seeded: 55
```

### Troubleshooting

Common issues and solutions:

1. **Database Connection Error**: Check your `.env` file and database configuration
2. **Missing Data Files**: Ensure all JSON files in `data/` directory exist
3. **Permission Errors**: Make sure the script has read access to data files
4. **Prisma Errors**: Run `npx prisma generate` and `npx prisma db push`

### Development

To modify or extend the seeding:

1. Edit the relevant function in `master-seed.js`
2. Test with a development database
3. Update this documentation if needed

The script is modular - each seeding function can be imported and used individually if needed.
