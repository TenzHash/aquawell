import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const ADMIN_EMAIL = (process.env.AQUAWELL_ADMIN_EMAIL || 'admin@aquawell.test').trim().toLowerCase();
const ADMIN_NAME = process.env.AQUAWELL_ADMIN_NAME || 'AquaWell Administrator';
const CONTACT_NUMBER = process.env.AQUAWELL_ADMIN_CONTACT || 'N/A';

if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL (or VITE_SUPABASE_URL).');
if (!SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY). Use it only locally; never put it in frontend code.');

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const password = `Aw!${randomBytes(12).toString('base64url')}9#`;
const [firstName, ...lastParts] = ADMIN_NAME.split(/\s+/);
const lastName = lastParts.length ? lastParts.join(' ') : 'Administrator';

async function findAuthUserByEmail(email) {
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`Unable to inspect Auth users: ${error.message}`);
    const found = data.users.find((u) => (u.email || '').toLowerCase() === email);
    if (found) return found;
    if (data.users.length < 1000) return null;
    page += 1;
  }
}

async function assertClean() {
  const authUser = await findAuthUserByEmail(ADMIN_EMAIL);
  if (authUser) throw new Error(`Refusing to overwrite existing Auth user: ${ADMIN_EMAIL} (${authUser.id}).`);

  const { data: adminProfiles, error: profileError } = await admin
    .from('profiles').select('id,email,role').eq('role', 'admin');
  if (profileError) throw new Error(`Unable to inspect admin profiles: ${profileError.message}`);
  if (adminProfiles?.length) throw new Error(`Refusing to create another Admin: ${adminProfiles.length} admin profile(s) already exist.`);

  const { data: adminStaff, error: staffError } = await admin
    .from('staff').select('staff_id,email,role,profile_id').eq('role', 'Admin');
  if (staffError) throw new Error(`Unable to inspect admin staff: ${staffError.message}`);
  if (adminStaff?.length) throw new Error(`Refusing to create another Admin: ${adminStaff.length} Admin staff record(s) already exist.`);

  const { data: emailStaff, error: emailStaffError } = await admin
    .from('staff').select('staff_id,email,role,profile_id').ilike('email', ADMIN_EMAIL);
  if (emailStaffError) throw new Error(`Unable to inspect staff email: ${emailStaffError.message}`);
  if (emailStaff?.length) throw new Error(`Refusing to reuse an existing staff email: ${ADMIN_EMAIL}.`);

  const { data: emailCustomers, error: customerError } = await admin
    .from('customers').select('customer_id,email,profile_id').ilike('email', ADMIN_EMAIL);
  if (customerError) throw new Error(`Unable to inspect customer email: ${customerError.message}`);
  if (emailCustomers?.length) throw new Error(`Refusing to reuse an existing customer email: ${ADMIN_EMAIL}.`);
}

let createdUserId = null;
let createdStaffId = null;

try {
  console.log('AquaWell one-time Admin bootstrap');
  console.log(`Target: ${ADMIN_EMAIL}`);
  console.log('Safety check: verifying that no Admin or target account already exists...');
  await assertClean();

  console.log('Creating Auth user through Supabase Auth Admin API...');
  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password,
    email_confirm: true,
    user_metadata: { full_name: ADMIN_NAME },
  });
  if (authError || !created?.user) {
    throw new Error(`Auth Admin API failed: ${authError?.message || 'No user returned.'}`);
  }
  createdUserId = created.user.id;

  // handle_new_user should create this row synchronously. We poll briefly for resilience.
  let profile = null;
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const { data, error } = await admin
      .from('profiles').select('id,email,full_name,phone,role').eq('id', createdUserId).maybeSingle();
    if (error) throw new Error(`Unable to verify profile after Auth creation: ${error.message}`);
    if (data) { profile = data; break; }
    await sleep(250 * attempt);
  }
  if (!profile) throw new Error('Auth user was created, but handle_new_user did not produce the expected profiles row.');

  console.log('Profile trigger verified. Creating Admin staff record...');
  const { data: staff, error: staffInsertError } = await admin
    .from('staff')
    .insert({
      first_name: firstName || 'AquaWell',
      middle_name: '',
      last_name: lastName,
      suffix: '',
      role: 'Admin',
      contact_number: CONTACT_NUMBER,
      email: ADMIN_EMAIL,
      profile_id: createdUserId,
    })
    .select('staff_id,first_name,last_name,role,email,profile_id')
    .single();

  if (staffInsertError || !staff) {
    throw new Error(`Failed to create Admin staff record: ${staffInsertError?.message || 'No staff row returned.'}`);
  }
  createdStaffId = staff.staff_id;

  // The existing staff trigger should set the profile role to admin. Ensure the final
  // trusted role is correct without touching user_metadata.role.
  const { error: roleError } = await admin
    .from('profiles')
    .update({ role: 'admin', full_name: ADMIN_NAME, email: ADMIN_EMAIL, phone: CONTACT_NUMBER })
    .eq('id', createdUserId);
  if (roleError) throw new Error(`Failed to finalize Admin profile: ${roleError.message}`);

  const { data: verifiedProfile, error: verifyProfileError } = await admin
    .from('profiles').select('id,email,full_name,role').eq('id', createdUserId).single();
  if (verifyProfileError) throw new Error(`Profile verification failed: ${verifyProfileError.message}`);

  const { data: verifiedStaff, error: verifyStaffError } = await admin
    .from('staff').select('staff_id,email,role,profile_id').eq('staff_id', createdStaffId).single();
  if (verifyStaffError) throw new Error(`Staff verification failed: ${verifyStaffError.message}`);

  if (verifiedProfile.role !== 'admin') throw new Error(`Verification failed: profile role is ${verifiedProfile.role}, expected admin.`);
  if (verifiedStaff.role !== 'Admin') throw new Error(`Verification failed: staff role is ${verifiedStaff.role}, expected Admin.`);
  if (verifiedStaff.profile_id !== createdUserId) throw new Error('Verification failed: staff.profile_id does not match auth.users.id/profile.id.');

  console.log('\nSUCCESS — one AquaWell Admin account was created.');
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${password}`);
  console.log(`Auth/Profile UUID: ${createdUserId}`);
  console.log(`Staff ID: ${createdStaffId}`);
  console.log(`Profile role: ${verifiedProfile.role}`);
  console.log(`Staff role: ${verifiedStaff.role}`);
  console.log(`Staff profile_id matches Auth/Profile: ${verifiedStaff.profile_id === createdUserId}`);
  console.log('\nSAVE THE PASSWORD NOW. It will not be printed again by this script.');
} catch (error) {
  console.error(`\nBOOTSTRAP FAILED: ${error.message}`);
  if (createdStaffId) {
    await admin.from('staff').delete().eq('staff_id', createdStaffId);
  }
  if (createdUserId) {
    const { error: deleteError } = await admin.auth.admin.deleteUser(createdUserId);
    if (deleteError) console.error(`WARNING: cleanup could not delete newly created Auth user ${createdUserId}: ${deleteError.message}`);
    else console.error('Cleanup: newly created Auth user was removed.');
  }
  process.exitCode = 1;
}
