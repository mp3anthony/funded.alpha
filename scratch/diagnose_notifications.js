/**
 * Diagnostic Script: Check Supabase Notification Tables
 * 
 * This script checks:
 * 1. Can we connect to Supabase?
 * 2. Does the `notification_settings` table exist?
 * 3. Does the `notifications` table exist?
 * 4. Are there any RLS issues blocking access?
 * 5. What data (if any) is in these tables?
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local (no dotenv dependency needed)
const envPath = path.resolve(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      envVars[trimmed.substring(0, eqIdx).trim()] = trimmed.substring(eqIdx + 1).trim();
    }
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

console.log('===================================================');
console.log('  NOTIFICATION TABLES DIAGNOSTIC');
console.log('===================================================');
console.log('Supabase URL: ' + supabaseUrl.substring(0, 30) + '...');
console.log('');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runDiagnostics() {
  // Test 1: notification_settings table
  console.log('TEST 1: Querying notification_settings table...');
  const { data: settingsData, error: settingsError, status: settingsStatus } = await supabase
    .from('notification_settings')
    .select('*')
    .limit(5);

  if (settingsError) {
    console.log('   ERROR (HTTP ' + settingsStatus + '): ' + settingsError.message);
    console.log('      Code: ' + (settingsError.code || 'N/A'));
    console.log('      Hint: ' + (settingsError.hint || 'N/A'));
    console.log('      Details: ' + (settingsError.details || 'N/A'));
    if (settingsError.message?.includes('does not exist') || settingsError.code === '42P01') {
      console.log('   DIAGNOSIS: Table does not exist! Needs to be created.');
    } else if (settingsStatus === 401 || settingsStatus === 403) {
      console.log('   DIAGNOSIS: RLS is blocking access (no policy for anon/unauthenticated).');
    }
  } else {
    console.log('   OK - Table exists and is queryable.');
    console.log('   Rows returned: ' + (settingsData?.length || 0));
    if (settingsData && settingsData.length > 0) {
      console.log('   Sample row:', JSON.stringify(settingsData[0], null, 2));
    }
  }
  console.log('');

  // Test 2: notifications table
  console.log('TEST 2: Querying notifications table...');
  const { data: notifsData, error: notifsError, status: notifsStatus } = await supabase
    .from('notifications')
    .select('*')
    .limit(5);

  if (notifsError) {
    console.log('   ERROR (HTTP ' + notifsStatus + '): ' + notifsError.message);
    console.log('      Code: ' + (notifsError.code || 'N/A'));
    console.log('      Hint: ' + (notifsError.hint || 'N/A'));
    console.log('      Details: ' + (notifsError.details || 'N/A'));
    if (notifsError.message?.includes('does not exist') || notifsError.code === '42P01') {
      console.log('   DIAGNOSIS: Table does not exist! Needs to be created.');
    } else if (notifsStatus === 401 || notifsStatus === 403) {
      console.log('   DIAGNOSIS: RLS is blocking access (no policy for anon/unauthenticated).');
    }
  } else {
    console.log('   OK - Table exists and is queryable.');
    console.log('   Rows returned: ' + (notifsData?.length || 0));
    if (notifsData && notifsData.length > 0) {
      console.log('   Sample row:', JSON.stringify(notifsData[0], null, 2));
    }
  }
  console.log('');

  // Test 3: Try inserting into notification_settings (to simulate what AppContext does)
  console.log('TEST 3: Testing INSERT into notification_settings (dry run with fake user_id)...');
  const fakeUserId = '00000000-0000-0000-0000-000000000000';
  const { data: insertData, error: insertError, status: insertStatus } = await supabase
    .from('notification_settings')
    .insert({
      user_id: fakeUserId,
      all_enabled: true,
      manual_bill_reminders: true,
      lodge_payment_reminders: true,
      auto_pay_reminders: true,
      manual_bill_reminder_days: 3,
      auto_pay_reminder_days: 1
    })
    .select()
    .single();

  if (insertError) {
    console.log('   INSERT ERROR (HTTP ' + insertStatus + '): ' + insertError.message);
    console.log('      Code: ' + (insertError.code || 'N/A'));
    if (insertError.code === '42P01') {
      console.log('   DIAGNOSIS: Table does not exist.');
    } else if (insertError.code === '42501' || insertStatus === 403) {
      console.log('   DIAGNOSIS: RLS is blocking inserts (no INSERT policy).');
    } else if (insertError.code === '23503') {
      console.log('   DIAGNOSIS: Foreign key violation - user_id references auth.users, expected for fake ID.');
      console.log('   This means the table EXISTS and has proper constraints. Good sign!');
    } else if (insertError.code === '23505') {
      console.log('   DIAGNOSIS: Duplicate key - a row already exists. Table exists!');
    }
  } else {
    console.log('   INSERT succeeded (will clean up).');
    await supabase.from('notification_settings').delete().eq('user_id', fakeUserId);
    console.log('   Cleaned up test row.');
  }
  console.log('');

  // Summary
  console.log('===================================================');
  console.log('  SUMMARY');
  console.log('===================================================');
  
  const settingsTableExists = !settingsError || (settingsError.code !== '42P01' && !settingsError.message?.includes('does not exist'));
  const notifsTableExists = !notifsError || (notifsError.code !== '42P01' && !notifsError.message?.includes('does not exist'));
  
  console.log('  notification_settings table: ' + (settingsTableExists ? 'EXISTS' : 'MISSING'));
  console.log('  notifications table:         ' + (notifsTableExists ? 'EXISTS' : 'MISSING'));
  
  if (!settingsTableExists || !notifsTableExists) {
    console.log('');
    console.log('  ACTION NEEDED: One or both notification tables are missing.');
    console.log('  A migration needs to be created and run to fix this.');
  } else if (settingsError || notifsError) {
    console.log('');
    console.log('  ACTION NEEDED: Tables exist but have access issues (likely RLS).');
    console.log('  RLS policies need to be added for authenticated users.');
  } else {
    console.log('');
    console.log('  Both tables exist and are accessible (as anon).');
    console.log('  The issue may be RLS blocking authenticated users specifically,');
    console.log('  or a client-side rendering issue on Android.');
  }
  console.log('');
}

runDiagnostics().catch(err => {
  console.error('Fatal error running diagnostics:', err);
  process.exit(1);
});
