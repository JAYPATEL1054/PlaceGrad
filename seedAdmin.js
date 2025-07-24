require('dotenv').config();
const connectDB = require('./config/database');
const User = require('./models/User');

async function seedAdmin() {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
    process.exit(1);
  }

  const existingAdmin = await User.findOne({ email: adminEmail, role: 'admin' });
  if (existingAdmin) {
    console.log('Admin user already exists:', existingAdmin.email);
    process.exit(0);
  }

  const adminUser = new User({
    username: 'Admin',
    email: adminEmail,        
    password: adminPassword, 
    role: 'admin',
    isEmailVerified: true,
    isActive: true,
    profile: { firstName: 'Admin', lastName: 'User' }
  });

  await adminUser.save();
  console.log('Admin user created:', adminEmail);
  process.exit(0);
}

seedAdmin().catch(err => {
  console.error('Error seeding admin user:', err);
  process.exit(1);
});
