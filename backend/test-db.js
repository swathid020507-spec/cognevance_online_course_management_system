const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const testAtlasConnection = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  console.log('================================================================================');
  console.log('🔍 Testing MongoDB Atlas Connection');
  console.log('================================================================================');

  if (!uri) {
    console.error('❌ Error: MONGODB_URI is not defined in backend/.env');
    console.error('Please open backend/.env and add:');
    console.error('MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/cognevance_lms?retryWrites=true&w=majority');
    process.exit(1);
  }

  if (uri.includes('<password>') || uri.includes('<username>')) {
    console.error('⚠️  Notice: Placeholder detected in MONGODB_URI.');
    console.error('Please open backend/.env and replace <username> and <password> with your actual Atlas credentials.');
    console.log('Target Database: cognevance_lms');
    process.exit(1);
  }

  // Obfuscate password in console output for privacy
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log(`Connecting to: ${maskedUri}`);

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'cognevance_lms',
      serverSelectionTimeoutMS: 6000,
    });

    console.log('--------------------------------------------------------------------------------');
    console.log('✅ Connection to MongoDB Atlas SUCCESSFUL!');
    console.log(`Cluster Host:      ${conn.connection.host}`);
    console.log(`Active Database:   ${conn.connection.name}`);
    console.log(`Ready State:       Connected (Code 1)`);
    console.log('--------------------------------------------------------------------------------');

    await mongoose.disconnect();
    console.log('Disconnected gracefully. You are ready to start the server with: npm run dev');
    process.exit(0);
  } catch (err) {
    console.error('--------------------------------------------------------------------------------');
    console.error(`❌ Connection FAILED: ${err.message}`);
    console.error('--------------------------------------------------------------------------------');
    if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      console.error('👉 Tip: Double check your Database Username and Password in MongoDB Atlas (under Database Access).');
    } else if (err.message.includes('querySrv') || err.message.includes('ENOTFOUND')) {
      console.error('👉 Tip: Check your cluster address (e.g. <your-cluster>.mongodb.net).');
    } else if (err.message.includes('whitelist') || err.message.includes('IP') || err.message.includes('timed out')) {
      console.error('👉 Tip: In MongoDB Atlas under "Network Access", ensure your IP address or 0.0.0.0/0 (Allow Anywhere) is added.');
    }
    process.exit(1);
  }
};

testAtlasConnection();
