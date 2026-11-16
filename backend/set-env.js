const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');

const envPath = path.join(__dirname, '.env');

// Helper to update MONGODB_URI in .env file while preserving all other variables
const updateEnvFile = (newUri) => {
  let existingContent = '';
  if (fs.existsSync(envPath)) {
    existingContent = fs.readFileSync(envPath, 'utf8');
  }

  // Ensure file is writable
  try {
    fs.chmodSync(envPath, 0o666);
  } catch (e) {
    // ignore if chmod not supported on OS
  }

  let cleanedUri = newUri.trim().replace(/^["']|["']$/g, '');

  // Ensure database name is cognevance_lms if missing before query parameters
  if (cleanedUri.startsWith('mongodb+srv://') || cleanedUri.startsWith('mongodb://')) {
    const urlParts = cleanedUri.split('?');
    const basePart = urlParts[0];
    const queryPart = urlParts[1] ? `?${urlParts[1]}` : '?retryWrites=true&w=majority';

    // If basePart ends with slash or domain without db name
    const match = basePart.match(/^(mongodb(?:\+srv)?:\/\/[^/]+)(?:\/([^/?]+)?)?$/);
    if (match) {
      const serverPrefix = match[1];
      const existingDb = match[2];
      if (!existingDb || existingDb === '') {
        cleanedUri = `${serverPrefix}/cognevance_lms${queryPart}`;
      } else if (existingDb !== 'cognevance_lms') {
        cleanedUri = `${serverPrefix}/cognevance_lms${queryPart}`;
      }
    }
  }

  // Default config if .env was empty
  const defaultVars = {
    PORT: '5000',
    NODE_ENV: 'development',
    MONGODB_URI: cleanedUri,
    JWT_SECRET: 'cognevance_fullstack_internship_jwt_secret_key_2026',
    JWT_EXPIRE: '30d',
    ADMIN_SECRET: 'ADMIN2026',
  };

  let newLines = [];
  if (existingContent.trim()) {
    let uriReplaced = false;
    const lines = existingContent.split(/\r?\n/);
    for (const line of lines) {
      if (line.startsWith('MONGODB_URI=') || line.startsWith('MONGO_URI=')) {
        newLines.push(`MONGODB_URI=${cleanedUri}`);
        uriReplaced = true;
      } else {
        newLines.push(line);
      }
    }
    if (!uriReplaced) {
      newLines.push(`MONGODB_URI=${cleanedUri}`);
    }
  } else {
    newLines = [
      'PORT=5000',
      'NODE_ENV=development',
      `MONGODB_URI=${cleanedUri}`,
      'JWT_SECRET=cognevance_fullstack_internship_jwt_secret_key_2026',
      'JWT_EXPIRE=30d',
      'ADMIN_SECRET=ADMIN2026',
    ];
  }

  const finalContent = newLines.join('\n') + '\n';
  fs.writeFileSync(envPath, finalContent, { encoding: 'utf8', flag: 'w' });
  console.log('--------------------------------------------------------------------------------');
  console.log('💾 [Success]: backend/.env has been safely updated and saved.');
  console.log('Database Name target: cognevance_lms');
  console.log('--------------------------------------------------------------------------------');

  return cleanedUri;
};

// Test the updated URI with Mongoose
const testConnection = async (uri) => {
  console.log('🔍 Testing connection to MongoDB Atlas...');
  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'cognevance_lms',
      serverSelectionTimeoutMS: 6000,
    });
    console.log('--------------------------------------------------------------------------------');
    console.log('🎉 [Atlas Connected Successfully!]');
    console.log(`Cluster Host:    ${conn.connection.host}`);
    console.log(`Database Name:   ${conn.connection.name}`);
    console.log('All backend APIs will now persist data directly in your cloud cluster.');
    console.log('--------------------------------------------------------------------------------');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('--------------------------------------------------------------------------------');
    console.error(`⚠️  [Connection Notice]: ${err.message}`);
    console.error('The .env file was saved successfully, but Atlas rejected the connection test.');
    if (err.message.includes('Authentication failed') || err.message.includes('bad auth')) {
      console.error('👉 Double-check your Atlas Database User password (under Database Access).');
    } else if (err.message.includes('querySrv') || err.message.includes('ENOTFOUND')) {
      console.error('👉 Double-check the cluster host domain in your connection string.');
    } else {
      console.error('👉 In Atlas Network Access, make sure your IP or 0.0.0.0/0 (Allow Anywhere) is added.');
    }
    console.error('--------------------------------------------------------------------------------');
    process.exit(0);
  }
};

// Main execution
const argUri = process.argv[2];

if (argUri && argUri.trim()) {
  const savedUri = updateEnvFile(argUri);
  testConnection(savedUri);
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('================================================================================');
  console.log('🔐 Cognevance LMS - MongoDB Atlas Connection Setup Helper');
  console.log('================================================================================');
  console.log('This tool safely writes your connection string to backend/.env without exposing it.');
  console.log('Example: mongodb+srv://<username>:<password>@<your-cluster>.mongodb.net/cognevance_lms?retryWrites=true&w=majority');
  console.log('');

  rl.question('Paste your MongoDB Atlas Connection String here: ', (input) => {
    rl.close();
    if (!input || !input.trim()) {
      console.error('❌ Error: No connection string provided. Aborted without modifying .env.');
      process.exit(1);
    }
    const savedUri = updateEnvFile(input);
    testConnection(savedUri);
  });
}
