<template>
  <section class="auth-card auth-card-medium">
    <div class="auth-card-header">
      <h1 class="auth-title">Forgot Password</h1>
      <p class="auth-copy">Enter your email address and we’ll send you a secure link to reset your password.</p>
    </div>

    <form class="auth-form">
      <label class="field-group">
        <span class="field-label">Email Address</span>
        <input class="field auth-field" type="email" placeholder="name@company.com" />
      </label>

      <button class="primary-button auth-submit">Send Reset Link</button>
    </form>

    <div class="auth-back-row">
      <RouterLink class="auth-link auth-link-inline" to="/login">
        <span class="material-symbols-outlined">arrow_back</span>
        <span>Back to Login</span>
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
