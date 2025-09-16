import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ajwpxsqfyhdsirreqzyl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqd3B4c3FmeWhkc2lycmVxenlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMjQ5OTAsImV4cCI6MjA3MzYwMDk5MH0.xpWQ4ARFYs9E-aPweUZbUj5IvNK2LaIGhT5N2xcwApQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

