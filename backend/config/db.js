const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoURI) {
    console.warn('[MongoDB Atlas Warning]: Neither MONGODB_URI nor MONGO_URI is defined in backend/.env.');
    console.log('[DataService]: Running in dynamic fallback mode.');
    return;
  }

  // Check for unreplaced template placeholders
  if (mongoURI.includes('<password>') || mongoURI.includes('<username>')) {
    console.warn('--------------------------------------------------------------------------------');
    console.warn('⚠️  [MongoDB Atlas Configuration Needed]:');
    console.warn('Your backend/.env file contains template placeholders (<password> or <username>).');
    console.warn('Please open backend/.env and replace them with your MongoDB Atlas credentials.');
    console.warn('Database target: cognevance_lms');
    console.warn('--------------------------------------------------------------------------------');
    console.log('[DataService]: Activated resilient in-memory fallback store so APIs stay responsive.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      dbName: 'cognevance_lms', // Guarantees database name is cognevance_lms
      serverSelectionTimeoutMS: 5000,
    });

    console.log('--------------------------------------------------------------------------------');
    console.log(`✅ [MongoDB Atlas Connected Successfully]`);
    console.log(`Cluster Host: ${conn.connection.host}`);
    console.log(`Active Database: ${conn.connection.name}`);
    console.log('--------------------------------------------------------------------------------');

    // Auto-seed if database is currently empty
    const { autoSeedMongoIfEmpty } = require('../services/dataService');
    await autoSeedMongoIfEmpty();
  } catch (error) {
    console.error('--------------------------------------------------------------------------------');
    console.error(`❌ [MongoDB Atlas Connection Error]: ${error.message}`);
    if (error.message.includes('Authentication failed') || error.message.includes('bad auth')) {
      console.error('Tip: Check that your database username and password in MONGODB_URI are correct.');
    } else if (error.message.includes('querySrv') || error.message.includes('ENOTFOUND')) {
      console.error('Tip: Check that your cluster domain name in MONGODB_URI is spelled correctly.');
    } else if (error.message.includes('whitelist') || error.message.includes('IP')) {
      console.error('Tip: In MongoDB Atlas Network Access, ensure 0.0.0.0/0 (allow access from anywhere) is added.');
    }
    console.error('--------------------------------------------------------------------------------');
    console.log('[DataService]: Operating with fallback store so platform remains live for evaluation.');
  }
};

module.exports = connectDB;
