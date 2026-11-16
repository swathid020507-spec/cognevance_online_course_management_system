const dns = require('dns');
const net = require('net');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// 1. Check .env loading
const envResult = dotenv.config({ path: path.join(__dirname, '.env') });

console.log('================================================================================');
console.log('🩺 MongoDB Atlas Connection Step-by-Step Diagnostic');
console.log('================================================================================');

if (envResult.error) {
  console.log('❌ Step 1: Failed to load backend/.env file:', envResult.error.message);
  process.exit(1);
} else {
  console.log('✅ Step 1: backend/.env file loaded successfully.');
}

const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!rawUri) {
  console.log('❌ Step 2: Neither MONGODB_URI nor MONGO_URI is defined in backend/.env.');
  process.exit(1);
}

// 2. Parse URI securely without exposing credentials
let protocol = '';
let hasUser = false;
let hasPass = false;
let containsPlaceholders = false;
let rawHost = '';
let dbName = '';
let queryParams = '';
let passwordHasSpecialChars = false;

try {
  if (rawUri.startsWith('mongodb+srv://')) {
    protocol = 'mongodb+srv://';
  } else if (rawUri.startsWith('mongodb://')) {
    protocol = 'mongodb://';
  } else {
    console.log('❌ Step 2: Invalid protocol. URI must start with mongodb+srv:// or mongodb://');
    process.exit(1);
  }

  if (rawUri.includes('<password>') || rawUri.includes('<username>')) {
    containsPlaceholders = true;
  }

  const withoutProtocol = rawUri.slice(protocol.length);
  const atIndex = withoutProtocol.lastIndexOf('@');

  if (atIndex === -1) {
    console.log('❌ Step 2: Missing authentication credentials (no @ symbol separating user:pass from cluster).');
    process.exit(1);
  }

  const userPassPart = withoutProtocol.slice(0, atIndex);
  const hostAndDbPart = withoutProtocol.slice(atIndex + 1);

  const colonIndex = userPassPart.indexOf(':');
  if (colonIndex !== -1) {
    hasUser = colonIndex > 0;
    const pass = userPassPart.slice(colonIndex + 1);
    hasPass = pass.length > 0;

    // Check if password has unencoded special characters: @, :, /, ?, #, [ ], %
    if (/[:/?#\[\]@]/.test(pass)) {
      passwordHasSpecialChars = true;
    }
  } else {
    hasUser = userPassPart.length > 0;
  }

  const slashIndex = hostAndDbPart.indexOf('/');
  const questionIndex = hostAndDbPart.indexOf('?');

  if (slashIndex !== -1) {
    rawHost = hostAndDbPart.slice(0, slashIndex);
    if (questionIndex !== -1) {
      dbName = hostAndDbPart.slice(slashIndex + 1, questionIndex);
      queryParams = hostAndDbPart.slice(questionIndex + 1);
    } else {
      dbName = hostAndDbPart.slice(slashIndex + 1);
    }
  } else {
    if (questionIndex !== -1) {
      rawHost = hostAndDbPart.slice(0, questionIndex);
      queryParams = hostAndDbPart.slice(questionIndex + 1);
    } else {
      rawHost = hostAndDbPart;
    }
  }

  console.log('✅ Step 2: URI Syntax Verification (Credentials Protected):');
  console.log(`   - Protocol:                   ${protocol}`);
  console.log(`   - Username Configured:        ${hasUser ? 'Yes' : 'NO'}`);
  console.log(`   - Password Configured:        ${hasPass ? 'Yes' : 'NO'}`);
  console.log(`   - Contains <template> tags:   ${containsPlaceholders ? 'YES (Must be replaced!)' : 'No (Good)'}`);
  console.log(`   - Password Special Chars:     ${passwordHasSpecialChars ? 'WARNING (Contains raw special chars like @, :, /, # that must be URL-encoded)' : 'Valid characters'}`);
  console.log(`   - Target Cluster Host:        ${rawHost}`);
  console.log(`   - Target Database Name:       ${dbName || '(Empty in URI, will use cognevance_lms)'}`);
  console.log(`   - Query Options:              ${queryParams || 'None'}`);
} catch (parseErr) {
  console.log('❌ Step 2: Failed to parse URI syntax:', parseErr.message);
  process.exit(1);
}

if (containsPlaceholders) {
  console.log('❌ Exact Issue: Your MONGODB_URI still contains placeholder text <username> or <password>.');
  process.exit(1);
}

// 3. DNS Lookup
const runNetworkChecks = async () => {
  console.log('--------------------------------------------------------------------------------');
  console.log('🌐 Step 3: Checking DNS Resolution & Reachability...');

  let targetHosts = [];

  if (protocol === 'mongodb+srv://') {
    const srvRecord = `_mongodb._tcp.${rawHost}`;
    try {
      const addresses = await new Promise((resolve, reject) => {
        dns.resolveSrv(srvRecord, (err, addrs) => {
          if (err) reject(err);
          else resolve(addrs);
        });
      });
      console.log(`✅ Step 3A: DNS SRV resolution succeeded! Found ${addresses.length} cluster nodes:`);
      addresses.forEach((a, i) => {
        console.log(`   Node ${i + 1}: ${a.name}:${a.port}`);
      });
      targetHosts = addresses.map((a) => ({ host: a.name, port: a.port }));
    } catch (srvErr) {
      console.log(`❌ Step 3A: DNS SRV resolution failed for ${srvRecord}:`, srvErr.code || srvErr.message);
      console.log('👉 Possible cause: Cluster name does not exist, DNS is blocked, or cluster was recently created.');
      return;
    }
  } else {
    targetHosts = [{ host: rawHost.split(':')[0], port: parseInt(rawHost.split(':')[1] || 27017, 10) }];
  }

  // 4. TCP Reachability Test (to port 27017 of the first node)
  if (targetHosts.length > 0) {
    const testNode = targetHosts[0];
    console.log(`📡 Step 4: Testing direct TCP connection to node ${testNode.host}:${testNode.port}...`);

    const tcpOk = await new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(4000);

      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve('TIMEOUT');
      });

      socket.on('error', (err) => {
        socket.destroy();
        resolve(err.code || err.message);
      });

      socket.connect(testNode.port, testNode.host);
    });

    if (tcpOk === true) {
      console.log(`✅ Step 4: TCP Port ${testNode.port} is reachable! Firewall / Network Access is OPEN.`);
    } else {
      console.log(`❌ Step 4: TCP connection failed with result: ${tcpOk}`);
      console.log('👉 Possible cause: Your current IP address is NOT whitelisted in MongoDB Atlas Network Access, or a local firewall/VPN is blocking outbound port 27017.');
    }
  }

  // 5. Mongoose Connection Authentication Test
  console.log('--------------------------------------------------------------------------------');
  console.log('🔐 Step 5: Testing Mongoose Authentication & Handshake...');

  try {
    const conn = await mongoose.connect(rawUri, {
      dbName: 'cognevance_lms',
      serverSelectionTimeoutMS: 5000,
    });

    console.log('🎉 Step 5: SUCCESS! Connected to MongoDB Atlas.');
    console.log(`   - Connected Host:   ${conn.connection.host}`);
    console.log(`   - Database Name:    ${conn.connection.name}`);
    console.log(`   - Connection State: Code 1 (Connected)`);
    await mongoose.disconnect();
    console.log('================================================================================');
    console.log('✅ ALL CHECKS PASSED: Your MongoDB Atlas setup is working perfectly.');
    console.log('================================================================================');
  } catch (mErr) {
    console.log('❌ Step 5: Mongoose Handshake / Auth Failed:');
    console.log(`   Error Name:    ${mErr.name}`);
    console.log(`   Error Message: ${mErr.message}`);
    console.log('--------------------------------------------------------------------------------');

    if (mErr.message.includes('Authentication failed') || mErr.message.includes('bad auth')) {
      console.log('🎯 EXACT ISSUE IDENTIFIED: BAD AUTHENTICATION');
      console.log('Reason: The username or password in MONGODB_URI does not match any user in MongoDB Atlas.');
      if (passwordHasSpecialChars) {
        console.log('NOTE: Your password contains special characters. Special characters like @, :, /, #, ? in MongoDB connection strings MUST be URL-encoded (e.g. "@" becomes "%40", ":" becomes "%3A")!');
      }
    } else if (mErr.message.includes('whitelist') || mErr.message.includes('timed out') || mErr.name === 'MongooseServerSelectionError') {
      console.log('🎯 EXACT ISSUE IDENTIFIED: SERVER SELECTION / NETWORK ACCESS TIMEOUT');
      console.log('Reason: MongoDB Atlas is rejecting incoming connections from your IP address or local network.');
    } else {
      console.log(`🎯 EXACT ISSUE IDENTIFIED: ${mErr.message}`);
    }
    console.log('================================================================================');
  }
};

runNetworkChecks();
