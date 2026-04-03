/**
 * Seed the initial platform admin account.
 *
 * Creates a magic-link (passwordless) auth user and sets their profile role to 'admin'.
 * Safe to run multiple times — skips if the user already exists.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 */

import { config } from 'dotenv';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: join(__dirname, '..', 'apps', 'web', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = 'jofftiquez@gmail.com';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in apps/web/.env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedAdmin() {
  console.info('=== Seed Platform Admin ===\n');
  console.info(`Email: ${ADMIN_EMAIL}`);

  // 1. Check if user already exists
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Failed to list users:', listError.message);
    process.exit(1);
  }

  const existing = existingUsers.users.find((u) => u.email === ADMIN_EMAIL);

  if (existing) {
    console.info(`\nUser already exists (id: ${existing.id}). Ensuring admin role...`);

    // Make sure the profile has admin role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', existing.id);

    if (updateError) {
      console.error('Failed to update profile role:', updateError.message);
      process.exit(1);
    }

    console.info('Admin role confirmed.');
    console.info('\nDone!');
    return;
  }

  // 2. Create auth user (magic link — no password)
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    email_confirm: true, // Auto-confirm so they can log in immediately
    user_metadata: {
      display_name: 'Joff Tiquez',
    },
  });

  if (createError) {
    console.error('Failed to create auth user:', createError.message);
    process.exit(1);
  }

  console.info(`\nAuth user created (id: ${newUser.user.id})`);

  // 3. The handle_new_user() trigger creates the profile automatically.
  //    Wait a moment for it to fire, then set admin role.
  await new Promise((r) => setTimeout(r, 1000));

  const { error: roleError } = await supabase
    .from('profiles')
    .update({ role: 'admin', display_name: 'Joff Tiquez' })
    .eq('id', newUser.user.id);

  if (roleError) {
    console.error('Failed to set admin role:', roleError.message);
    console.info('The auth user was created but the profile role was not set.');
    console.info('Run this script again or manually update the profile.');
    process.exit(1);
  }

  console.info('Profile role set to admin.');
  console.info('\nDone! Log in at the site using "Sign in with Magic Link" with this email.');
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
