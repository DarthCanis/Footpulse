import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// 1. Load environment variables with precedence: .env.local -> .env -> process.env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

let envLocalLoaded = false;
let envLoaded = false;

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
  envLocalLoaded = true;
}

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  envLoaded = true;
}

// Fallback dotenv default
dotenv.config();

const API_PROVIDER = process.env.FOOTBALL_API_PROVIDER || 'api-football';
const API_KEY = process.env.FOOTBALL_API_KEY || '';

function maskKey(key: string): string {
  if (!key) return '(not set)';
  if (key.length <= 8) return '****';
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)} (${key.length} chars)`;
}

async function runDiagnostic() {
  console.log('\n=============================================================');
  console.log('       ⚽ FOOTPULSE FOOTBALL API DIAGNOSTIC TEST RUNNER       ');
  console.log('=============================================================\n');

  console.log('📁 [1/4] Environment Files Check:');
  console.log(`  - .env.local detected: ${envLocalLoaded ? '✅ YES (' + envLocalPath + ')' : '❌ NO'}`);
  console.log(`  - .env detected:       ${envLoaded ? '✅ YES (' + envPath + ')' : 'ℹ️ NO'}`);

  console.log('\n🔑 [2/4] Configuration Verification:');
  console.log(`  - Provider:            ${API_PROVIDER}`);
  console.log(`  - FOOTBALL_API_KEY:    ${maskKey(API_KEY)}`);

  const isPlaceholder = !API_KEY || 
    API_KEY === 'YOUR_FOOTBALL_API_KEY_HERE' || 
    API_KEY.includes('YOUR_') || 
    API_KEY.trim() === '';

  if (isPlaceholder) {
    console.log('\n⚠️  [RESULT] FOOTBALL_API_KEY is not configured or is a placeholder.');
    console.log('   The application will operate in Interactive Simulator / Gemini Fallback Mode.');
    console.log('\n👉 To enable live data from your football provider:');
    console.log('   1. Create or open .env.local (or configure secrets in AI Studio Settings)');
    console.log('   2. Add: FOOTBALL_API_KEY=your_actual_key_here');
    console.log('   3. (Optional) Set: FOOTBALL_API_PROVIDER=api-football (or football-data)');
    console.log('   4. Re-run: npm run test:football-api\n');
    return;
  }

  console.log('\n🌐 [3/4] Testing Provider Connection & Authentication...');
  const startTime = Date.now();

  if (API_PROVIDER === 'api-football') {
    // Test API-Football (v3.football.api-sports.io)
    console.log('  Target: https://v3.football.api-sports.io/status');
    try {
      const statusRes = await fetch('https://v3.football.api-sports.io/status', {
        headers: { 'x-apisports-key': API_KEY }
      });
      const latency = Date.now() - startTime;
      const statusData = await statusRes.json();

      console.log(`  HTTP Status: ${statusRes.status} (${latency}ms)`);

      if (!statusRes.ok) {
        console.error(`\n❌ Authentication Failed: HTTP ${statusRes.status}`);
        console.error('Response:', JSON.stringify(statusData, null, 2));
        process.exitCode = 1;
        return;
      }

      if (statusData.errors && Object.keys(statusData.errors).length > 0) {
        console.error('\n❌ Provider returned error object:', statusData.errors);
        if (statusData.errors.token) {
          console.error('   Hint: The API key provided is invalid or inactive.');
        } else if (statusData.errors.requests) {
          console.error('   Hint: Daily request limit has been reached.');
        }
        process.exitCode = 1;
        return;
      }

      const account = statusData.response?.account;
      const subscription = statusData.response?.subscription;
      const requests = statusData.response?.requests;

      console.log('\n✅ [4/4] Authentication SUCCESSFUL!');
      console.log('-------------------------------------------------------------');
      if (account) {
        console.log(`  - Account Name:      ${account.firstname || ''} ${account.lastname || ''} (${account.email || 'N/A'})`);
      }
      if (subscription) {
        console.log(`  - Plan:              ${subscription.plan || 'Free'} (Active: ${subscription.active ? 'YES' : 'NO'})`);
      }
      if (requests) {
        console.log(`  - Requests Today:    ${requests.current} / ${requests.limit_day || 'Unlimited'}`);
      }

      // Quick test fixture query
      console.log('\n🧪 Testing Live Fixtures Query (Premier League ID: 39)...');
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const testSeason = currentMonth >= 7 ? currentYear : currentYear - 1;
      const fixRes = await fetch(`https://v3.football.api-sports.io/fixtures?league=39&season=${testSeason}&last=2`, {
        headers: { 'x-apisports-key': API_KEY }
      });
      const fixData = await fixRes.json();
      const fixturesCount = fixData.response?.length || 0;
      console.log(`  - Fixtures received: ${fixturesCount} matches retrieved successfully.`);

      console.log('\n🎉 ALL CHECKS PASSED: Server is fully authenticated and ready for live match streaming!\n');

    } catch (err: any) {
      console.error(`\n❌ Network Error during API call: ${err.message || err}`);
      process.exitCode = 1;
    }

  } else if (API_PROVIDER === 'football-data') {
    // Test Football-Data.org
    console.log('  Target: https://api.football-data.org/v4/competitions/PL');
    try {
      const compRes = await fetch('https://api.football-data.org/v4/competitions/PL', {
        headers: { 'X-Auth-Token': API_KEY }
      });
      const latency = Date.now() - startTime;
      const compData = await compRes.json();

      console.log(`  HTTP Status: ${compRes.status} (${latency}ms)`);

      if (!compRes.ok) {
        console.error(`\n❌ Authentication Failed: HTTP ${compRes.status}`);
        console.error('Response:', JSON.stringify(compData, null, 2));
        if (compRes.status === 403) {
          console.error('   Hint: Invalid or expired X-Auth-Token.');
        } else if (compRes.status === 429) {
          console.error('   Hint: Rate limit exceeded (free tier allows 10 req/min).');
        }
        process.exitCode = 1;
        return;
      }

      console.log('\n✅ [4/4] Authentication SUCCESSFUL!');
      console.log('-------------------------------------------------------------');
      console.log(`  - Competition Name:  ${compData.name} (${compData.code})`);
      console.log(`  - Current Season:    ${compData.currentSeason?.startDate} to ${compData.currentSeason?.endDate}`);

      console.log('\n🎉 ALL CHECKS PASSED: Server is fully authenticated with football-data.org!\n');
    } catch (err: any) {
      console.error(`\n❌ Network Error during API call: ${err.message || err}`);
      process.exitCode = 1;
    }
  } else {
    console.log(`\n⚠️  Unknown provider: ${API_PROVIDER}. Supported: 'api-football', 'football-data'.`);
  }
}

runDiagnostic().catch((e) => {
  console.error('Fatal diagnostic error:', e);
  process.exit(1);
});
