<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'

const email = ref('')
const password = ref('')
</script>

<template>
  <section class="auth-card auth-card-large">
    <div class="auth-card-header auth-card-header-center">
      <h1 class="auth-title">Welcome back</h1>
      <p class="auth-copy">Please enter your details to sign in.</p>
    </div>

    <form class="auth-form">
      <BaseInput v-model="email" label="Email Address" label-class="auth-label" type="email" placeholder="name@company.com" />

      <label class="field-group">
        <div class="auth-inline-row">
          <span class="field-label auth-label">Password</span>
          <RouterLink class="auth-link" to="/forgot-password">Forgot Password?</RouterLink>
        </div>
        <BaseInput v-model="password" type="password" placeholder="••••••••" />
      </label>

      <label class="auth-checkbox-row">
        <input type="checkbox" />
        <span>Remember me for 30 days</span>
      </label>

      <BaseButton class="auth-submit" type="submit" block>Sign In</BaseButton>
    </form>

    <div class="auth-divider"><span>Or continue with</span></div>

    <div class="auth-provider-grid">
      <BaseButton variant="secondary" class="auth-provider" block>Google</BaseButton>
      <BaseButton variant="secondary" class="auth-provider" block>GitHub</BaseButton>
    </div>

    <p class="auth-switch-copy">
      Don’t have an account?
      <RouterLink class="auth-link auth-link-strong" to="/sign-up">Request Access</RouterLink>
    </p>
  </section>
</template>
