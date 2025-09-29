import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bnbawiqdyatgvefcdeoz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuYmF3aXFkeWF0Z3ZlZmNkZW96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzYzMDEsImV4cCI6MjA3NDc1MjMwMX0.p0GxQtdKmkaaO1GrNMtjW55h9jJWeut0E1QD57q9Pi4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client for API routes
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuYmF3aXFkeWF0Z3ZlZmNkZW96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE3NjMwMSwiZXhwIjoyMDc0NzUyMzAxfQ.RjJj-byXEvL2waEFqZCKiuvpH_4-muj9IsykB_X9ssA',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
