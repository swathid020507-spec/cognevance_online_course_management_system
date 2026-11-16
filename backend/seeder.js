const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const { getSampleData } = require('./data/seedData');

dotenv.config();

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoURI || mongoURI.includes('<password>') || mongoURI.includes('<username>')) {
    console.error('--------------------------------------------------------------------------------');
    console.error('❌ [Seeder Error]: Invalid or unconfigured MONGODB_URI in backend/.env.');
    console.error('Please enter your actual MongoDB Atlas connection string in backend/.env first.');
    console.error('--------------------------------------------------------------------------------');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI, {
      dbName: 'cognevance_lms',
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[Seeder] Connected to MongoDB Atlas (Database: cognevance_lms)');
  } catch (error) {
    console.error('--------------------------------------------------------------------------------');
    console.error(`❌ [Seeder Error]: Could not connect to MongoDB Atlas at ${mongoURI}`);
    console.error(`Reason: ${error.message}`);
    console.error('--------------------------------------------------------------------------------');
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Enrollment.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();

    console.log('[Seeder] Cleared previous database collections.');

    const { users, courses, enrollments } = await getSampleData();

    // 1. Insert Users
    await User.insertMany(users);
    console.log(`[Seeder] Created ${users.length} default users (1 Admin, 2 Students).`);

    // 2. Insert Courses
    await Course.insertMany(courses);
    console.log(`[Seeder] Created ${courses.length} comprehensive technical courses.`);

    // 3. Insert Enrollments
    await Enrollment.insertMany(enrollments);
    console.log(`[Seeder] Created ${enrollments.length} sample enrollments with progress.`);

    console.log('----------------------------------------------------');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Default Accounts for Evaluation:');
    console.log('Admin Account:   admin@cognevance.com   / Admin@123');
    console.log('Student Account: student@cognevance.com / Student@123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Enrollment.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    console.log('🗑️  All data destroyed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
}
