const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://cswjhomkhuzxxdwvtbjv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzd2pob21raHV6eHhkd3Z0Ymp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMzIxMzEsImV4cCI6MjA5NzkwODEzMX0.84T-2RiFaVj7wVoxEYd4WXVJ_6i1IWKBaZp9CNtAlto';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: settings, error: settingsError } = await supabase.from('notification_settings').select('*').limit(1);
  if (settingsError) {
    console.error('Error fetching settings:', settingsError);
  } else {
    console.log('Settings keys:', settings.length > 0 ? Object.keys(settings[0]) : 'No settings found');
    console.log('Sample settings:', settings[0]);
  }
}

test();
