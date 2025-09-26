const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { PrismaClient, UserRole } = require('@prisma/client');

const prisma = new PrismaClient();

// Generate secure random password
function generateSecurePassword(length = 16) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each category
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Create JSON file with user credentials
async function createCredentialsFile(users) {
  try {
    const credentials = {
      generatedAt: new Date().toISOString(),
      totalUsers: users.length,
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        password: user.password,
        isActive: user.isActive,
        createdAt: user.createdAt
      }))
    };

    const filePath = path.join(__dirname, '..', 'user-credentials.json');
    await fs.promises.writeFile(filePath, JSON.stringify(credentials, null, 2));
    
    console.log('');
    console.log('📄 Credentials saved to: user-credentials.json');
    console.log('🔐 File contains all user credentials for reference');
    console.log('⚠️  Keep this file secure and delete after noting credentials!');
    
  } catch (error) {
    console.error('❌ Error creating credentials file:', error);
  }
}

async function createUsers() {
  try {
    // Define users to create
    const users = [
      {
        email: 'admin@neic-bd.org',
        name: 'System Administrator',
        role: UserRole.ADMIN
      },
      {
        email: 'manager@neic-bd.org',
        name: 'Management User',
        role: UserRole.MANAGEMENT
      },
      {
        email: 'support@neic-bd.org',
        name: 'Support Staff',
        role: UserRole.SUPPORT
      }
    ];

    const createdUsers = [];

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          email: userData.email
        }
      });

      if (existingUser) {
        console.log(`⚠️  User already exists: ${userData.email}`);
        continue;
      }

      // Generate secure password
      const password = generateSecurePassword(16);
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email.toLowerCase(),
          name: userData.name,
          passwordHash,
          role: userData.role,
          isActive: true,
          createdBy: 'system'
        }
      });

      createdUsers.push({
        ...user,
        password: password
      });

      console.log(`✅ ${userData.role} user created successfully!`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Name: ${user.name}`);
      console.log(`🔑 Role: ${user.role}`);
      console.log(`🆔 ID: ${user.id}`);
      console.log(`🔒 Password: ${password}`);
      console.log('');

      // Log user creation
      await prisma.userAuditLog.create({
        data: {
          userId: user.id,
          action: 'USER_CREATED',
          details: JSON.stringify({
            createdBy: 'system',
            role: userData.role,
            timestamp: new Date().toISOString()
          })
        }
      });
    }

    if (createdUsers.length > 0) {
      console.log('🎉 All users created successfully!');
      console.log('');
      console.log('📋 USER CREDENTIALS SUMMARY:');
      console.log('================================');
      createdUsers.forEach(user => {
        console.log(`👤 ${user.name} (${user.role})`);
        console.log(`📧 ${user.email}`);
        console.log(`🔒 ${user.password}`);
        console.log('');
      });
      console.log('⚠️  IMPORTANT: Please change all default passwords after first login!');
      
      // Create JSON file with credentials
      await createCredentialsFile(createdUsers);
    } else {
      console.log('ℹ️  All users already exist. No new users created.');
    }

  } catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createUsers();


// 👨‍💼 ADMIN: admin@neic-bd.org / [Random Secure Password]
// 👩‍💼 MANAGEMENT: manager@neic-bd.org / [Random Secure Password]
// 🧑‍💻 SUPPORT: support@neic-bd.org / [Random Secure Password]