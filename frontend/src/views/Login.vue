<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../store/auth'
import router from "../router";

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const auth = useAuthStore()

const submit = async () => {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    await router.push('/profile')
  } catch (e: any) {
    error.value = e.message || 'Nieprawidłowe dane logowania'
  }
  loading.value = false
}
</script>

<template>
  <v-container>
    <v-form @submit.prevent="submit" class="mx-auto" style="max-width: 350px">
      <v-text-field v-model="email" label="E-mail" type="email" required></v-text-field>
      <v-text-field v-model="password" label="Hasło" type="password" required></v-text-field>
      <v-btn :loading="loading" type="submit" color="primary" block>Logowanie</v-btn>
      <v-alert v-if="error" type="error" class="mt-2">{{ error }}</v-alert>
    </v-form>
  </v-container>
</template>
