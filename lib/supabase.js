// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fklwxvpsflkxoutmicol.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrbHd4dnBzZmxreG91dG1pY29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTczNDcsImV4cCI6MjA2NTY3MzM0N30.HW0Lz4cGDZqCAQVK0e8hChhoDCHemt6P8fNf8QzW-AQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
