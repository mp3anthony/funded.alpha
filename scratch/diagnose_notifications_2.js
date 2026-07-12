/**
 * Diagnostic Script 2: Check exact column schema of notification_settings
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  // Test: what columns does notification_settings actually have?
  // We can infer by trying to insert with only one column at a time
  console.log('=== COLUMN DISCOVERY: notification_settings ===');
  console.log('');
  
  const columnsToTest = [
    'id', 'user_id', 'all_enabled', 
    'manual_bill_reminders', 'lodge_payment_reminders', 'auto_pay_reminders',
    'manual_bill_reminder_days', 'auto_pay_reminder_days',
    'created_at', 'updated_at', 'household_id',
    'enabled', 'email_enabled', 'push_enabled', 'sms_enabled'
  ];
  
  for (const col of columnsToTest) {
    // Try selecting just this column
    const { data, error } = await supabase
      .from('notification_settings')
      .select(col)
      .limit(0);
    
    if (error) {
      console.log('  Column "' + col + '": MISSING (' + error.message + ')');
    } else {
      console.log('  Column "' + col + '": EXISTS');
    }
  }
  
  console.log('');
  console.log('=== COLUMN DISCOVERY: notifications ===');
  console.log('');
  
  const notifColumns = [
    'id', 'user_id', 'household_id', 'type', 'title', 'message',
    'is_read', 'related_entity_id', 'created_at', 'updated_at'
  ];
  
  for (const col of notifColumns) {
    const { data, error } = await supabase
      .from('notifications')
      .select(col)
      .limit(0);
    
    if (error) {
      console.log('  Column "' + col + '": MISSING (' + error.message + ')');
    } else {
      console.log('  Column "' + col + '": EXISTS');
    }
  }

  console.log('');
  console.log('=== RLS STATUS CHECK ===');
  console.log('(Checking if RLS blocks authenticated users by trying to read with anon key)');
  
  // Check if there are any rows at all
  const { count, error: countError } = await supabase
    .from('notification_settings')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.log('  Count query error: ' + countError.message);
  } else {
    console.log('  notification_settings total rows: ' + count);
  }

  const { count: nCount, error: nCountError } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true });
  
  if (nCountError) {
    console.log('  Count query error: ' + nCountError.message);
  } else {
    console.log('  notifications total rows: ' + nCount);
  }
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
