<template>
  <section class="auth-card auth-card-medium auth-card-spacious">
    <div class="auth-card-header">
      <h1 class="auth-title">Change Password</h1>
      <p class="auth-copy">Update your account security by choosing a strong, unique password.</p>
    </div>

    <form class="auth-form auth-form-tight">
      <label class="field-group">
        <span class="field-label auth-label">Current Password</span>
        <input class="field auth-field" type="password" placeholder="Enter current password" />
      </label>

      <label class="field-group">
        <span class="field-label auth-label">New Password</span>
        <input class="field auth-field" type="password" placeholder="Min. 8 characters" />
        <div class="password-strength">
          <span class="password-strength-bar active"></span>
          <span class="password-strength-bar active"></span>
          <span class="password-strength-bar active"></span>
          <span class="password-strength-bar"></span>
        </div>
        <div class="password-strength-copy">Strong password</div>
      </label>

      <label class="field-group">
        <span class="field-label auth-label">Confirm New Password</span>
        <input class="field auth-field" type="password" placeholder="Repeat your new password" />
      </label>

      <div class="auth-alert auth-alert-error">
        <span class="material-symbols-outlined">error</span>
        <span>New passwords do not match.</span>
      </div>

      <div class="auth-action-stack">
        <button class="primary-button auth-submit">Update Password</button>
        <button class="secondary-button auth-submit">Cancel</button>
      </div>
    </form>

    <div class="auth-tip">
      <div class="auth-tip-icon"><span class="material-symbols-outlined">security</span></div>
      <div>
        <div class="meta-title">Security Tip</div>
        <div class="meta-copy">Use a combination of letters, numbers, and symbols to keep your account protected.</div>
      </div>
    </div>
  </section>
</template>
