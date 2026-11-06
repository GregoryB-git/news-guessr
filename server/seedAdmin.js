const User = require('./models/User');

async function seedAdmin() {
  try {
    const adminEmail = 'gregor.bolshakov';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const admin = new User({
        email: adminEmail,
        password: '123321',
        displayName: 'Gregor',
        role: 'admin',
      });
      await admin.save();
      console.log(`Default admin account created: ${adminEmail}`);
    } else if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`Existing account promoted to admin: ${adminEmail}`);
    }
  } catch (err) {
    console.error('Error seeding admin account:', err.message);
  }
}

module.exports = { seedAdmin };
