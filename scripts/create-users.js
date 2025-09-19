// @ts-nocheck - This is a Node.js script, not TypeScript
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createUsers() {
  try {
    console.log('🚀 Creating Manager and Support users...\n');

    // User configurations
    const users = [
      {
        role: 'MANAGEMENT',
        email: process.env.MANAGER_EMAIL || 'manager@election-commission.gov.bd',
        password: process.env.MANAGER_PASSWORD || 'Manager2024!',
        name: process.env.MANAGER_NAME || 'Election Manager',
        envPrefix: 'MANAGER'
      },
      {
        role: 'SUPPORT',
        email: process.env.SUPPORT_EMAIL || 'support@election-commission.gov.bd',
        password: process.env.SUPPORT_PASSWORD || 'Support2024!',
        name: process.env.SUPPORT_NAME || 'Support Staff',
        envPrefix: 'SUPPORT'
      }
    ];

    for (const userConfig of users) {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userConfig.email.toLowerCase() },
            { role: userConfig.role }
          ]
        }
      });

      if (existingUser) {
        console.log(`⚠️  ${userConfig.role} user already exists:`, existingUser.email);
        console.log(`   Name: ${existingUser.name}`);
        console.log(`   Role: ${existingUser.role}`);
        console.log(`   Active: ${existingUser.isActive}\n`);
        continue;
      }

      // Validate password strength
      if (userConfig.password.length < 8) {
        throw new Error(`${userConfig.role} password must be at least 8 characters long`);
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(userConfig.password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userConfig.email.toLowerCase(),
          name: userConfig.name,
          passwordHash,
          role: userConfig.role,
          isActive: true,
          createdBy: 'system'
        }
      });

      console.log(`✅ ${userConfig.role} user created successfully!`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Name: ${user.name}`);
      console.log(`🔑 Role: ${user.role}`);
      console.log(`🆔 ID: ${user.id}`);
      console.log(`🔒 Default password: ${userConfig.password}`);
      console.log('');

      // Log user creation
      await prisma.userAuditLog.create({
        data: {
          userId: user.id,
          action: `${userConfig.role}_CREATED`,
          details: JSON.stringify({
            createdBy: 'system',
            timestamp: new Date().toISOString(),
            role: userConfig.role
          })
        }
      });
    }

    console.log('🎉 All users created successfully!');
    console.log('');
    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   • Please change default passwords after first login');
    console.log('   • Ensure strong password policies are enforced');
    console.log('   • Review user permissions and access levels');
    console.log('');
    console.log('📝 Default Credentials Summary:');
    console.log('   👩‍💼 MANAGEMENT: manager@election-commission.gov.bd / Manager2024!');
    console.log('   🧑‍💻 SUPPORT: support@election-commission.gov.bd / Support2024!');

  } catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Allow running with specific roles
async function createSpecificUser(role) {
  if (!['MANAGEMENT', 'SUPPORT'].includes(role.toUpperCase())) {
    console.error('❌ Invalid role. Use: MANAGEMENT or SUPPORT');
    process.exit(1);
  }

  const userConfigs = {
    MANAGEMENT: {
      role: 'MANAGEMENT',
      email: process.env.MANAGER_EMAIL || 'manager@election-commission.gov.bd',
      password: process.env.MANAGER_PASSWORD || 'Manager2024!',
      name: process.env.MANAGER_NAME || 'Election Manager'
    },
    SUPPORT: {
      role: 'SUPPORT',
      email: process.env.SUPPORT_EMAIL || 'support@election-commission.gov.bd',
      password: process.env.SUPPORT_PASSWORD || 'Support2024!',
      name: process.env.SUPPORT_NAME || 'Support Staff'
    }
  };

  const userConfig = userConfigs[role.toUpperCase()];

  try {
    console.log(`🚀 Creating ${userConfig.role} user...\n`);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userConfig.email.toLowerCase() },
          { role: userConfig.role }
        ]
      }
    });

    if (existingUser) {
      console.log(`⚠️  ${userConfig.role} user already exists:`, existingUser.email);
      return;
    }

    // Validate password strength
    if (userConfig.password.length < 8) {
      throw new Error(`${userConfig.role} password must be at least 8 characters long`);
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(userConfig.password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: userConfig.email.toLowerCase(),
        name: userConfig.name,
        passwordHash,
        role: userConfig.role,
        isActive: true,
        createdBy: 'system'
      }
    });

    console.log(`✅ ${userConfig.role} user created successfully!`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🔑 Role: ${user.role}`);
    console.log(`🆔 ID: ${user.id}`);
    console.log(`🔒 Default password: ${userConfig.password}`);

    // Log user creation
    await prisma.userAuditLog.create({
      data: {
        userId: user.id,
        action: `${userConfig.role}_CREATED`,
        details: JSON.stringify({
          createdBy: 'system',
          timestamp: new Date().toISOString(),
          role: userConfig.role
        })
      }
    });

  } catch (error) {
    console.error(`❌ Error creating ${userConfig.role} user:`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
  const role = args[0];
  createSpecificUser(role);
} else {
  createUsers();
}
