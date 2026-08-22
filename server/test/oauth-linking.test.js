// Google sign-in adopts an existing account when the email matches. Registration
// never verifies email ownership, so the rule about *when* that is safe is the
// only thing standing between a stranger's signup and a shared account.
//
//   MONGODB_URI=mongodb://127.0.0.1:27017/parkease npm test
//
// Creates its own throwaway users and deletes them again. Skipped without a URI.
require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
const EMAIL = 'oauth-linking-test@parkease.test';

// The strategy is only registered when Google credentials are present
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'test-secret';

const User = require('../models/User');
const passport = require('../config/passport');

const profile = {
  id: 'google-oauth-test-id',
  displayName: 'Google User',
  emails: [{ value: EMAIL }],
  photos: [{ value: 'https://example.test/avatar.png' }],
};

// Drive the strategy's verify callback the way Google's redirect would
const signInWithGoogle = () =>
  new Promise((resolve, reject) => {
    passport._strategy('google')._verify(null, null, profile, (err, user) =>
      err ? reject(err) : resolve(user)
    );
  });

test('google account linking', { skip: uri ? false : 'set MONGODB_URI to run' }, async (t) => {
  await mongoose.connect(uri);
  t.after(async () => {
    await User.deleteMany({ email: EMAIL });
    await mongoose.disconnect();
  });
  t.beforeEach(() => User.deleteMany({ email: EMAIL }));

  await t.test('refuses an unverified account that already has a password', async () => {
    // Someone signed up with an address they do not own and set a password
    await User.create({ name: 'Squatter', email: EMAIL, password: 'squatter-password' });

    assert.equal(await signInWithGoogle(), false, 'must not hand over the account');

    const user = await User.findOne({ email: EMAIL });
    assert.equal(user.googleId, undefined, 'and must not link either');
  });

  await t.test('links an account that has no password', async () => {
    await User.create({ name: 'Passwordless', email: EMAIL });

    const user = await signInWithGoogle();
    assert.equal(user.googleId, profile.id);
  });

  await t.test('links a verified account that has a password', async () => {
    await User.create({ name: 'Verified', email: EMAIL, password: 'a-real-password', isEmailVerified: true });

    const user = await signInWithGoogle();
    assert.equal(user.googleId, profile.id);
  });

  await t.test('creates a new account when the email is unknown', async () => {
    const user = await signInWithGoogle();
    assert.equal(user.email, EMAIL);
    assert.equal(user.googleId, profile.id);
    assert.equal(user.isEmailVerified, true, 'Google vouched for the address');
  });
});
