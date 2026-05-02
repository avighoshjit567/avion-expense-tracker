<template>
  <section class="auth-stack">
    <div class="auth-card auth-card-medium">
      <div class="auth-card-header">
        <h1 class="auth-title">Create your account</h1>
        <p class="auth-copy">Precision and clarity for your enterprise workflow.</p>
      </div>

      <form class="auth-form auth-form-tight">
        <label class="field-group">
          <span class="field-label">Full Name</span>
          <input class="field auth-field" type="text" placeholder="Enter your full name" />
        </label>

        <label class="field-group">
          <span class="field-label">Work Email</span>
          <input class="field auth-field" type="email" placeholder="name@company.com" />
        </label>

        <label class="field-group">
          <span class="field-label">Password</span>
          <input class="field auth-field" type="password" placeholder="••••••••" />
        </label>

        <label class="auth-checkbox-row auth-checkbox-top">
          <input type="checkbox" />
          <span>
            I agree to the <a class="auth-link" href="#">Terms of Service</a> and
            <a class="auth-link" href="#">Privacy Policy</a>.
          </span>
        </label>

        <button class="primary-button auth-submit auth-submit-hero">Create Account</button>
      </form>

      <div class="auth-switch-copy auth-switch-top-border">
        Already have an account?
        <RouterLink class="auth-link auth-link-strong" to="/login">Log in</RouterLink>
      </div>
    </div>

    <div class="auth-security-note">
      <span class="material-symbols-outlined">verified_user</span>
      <span>Enterprise Grade Security</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
