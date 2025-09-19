const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Get admin credentials from environment or use defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@election-commission.gov.bd';
    const adminPassword = process.env.ADMIN_PASSWORD || 'SecureAdmin2024!';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    // Validate password strength
    if (adminPassword.length < 12) {
      throw new Error('Admin password must be at least 12 characters long');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail.toLowerCase(),
        name: adminName,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
        createdBy: 'system'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🔑 Role:', admin.role);
    console.log('🆔 ID:', admin.id);
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the default password after first login!');
    console.log('🔒 Default password:', adminPassword);

    // Log admin creation
    await prisma.userAuditLog.create({
      data: {
        userId: admin.id,
        action: 'ADMIN_CREATED',
        details: JSON.stringify({
          createdBy: 'system',
          timestamp: new Date().toISOString()
        })
      }
    });

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser();


// 👨‍💼 ADMIN: admin@election-commission.gov.bd / NewSecurePassword2024!
// 👩‍💼 MANAGEMENT: manager@election-commission.gov.bd / Manager2024!
// 🧑‍💻 SUPPORT: support@election-commission.gov.bd / Support2024!