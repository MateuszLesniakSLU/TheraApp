<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../store/auth'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const auth = useAuthStore()

const submit = async () => {
  loading.value = true
  error.value = ''
  try {
    await auth.register(email.value, password.value)
  } catch (e: any) {
    error.value = e.message || 'Nie udało się zarejestrować'
  }
  loading.value = false
}
</script>

<template>
  <v-container>
    <v-form @submit.prevent="submit" class="mx-auto" style="max-width: 350px">
      <v-text-field v-model="email" label="E-mail" type="email" required></v-text-field>
      <v-text-field v-model="password" label="Hasło" type="password" required></v-text-field>
      <v-btn :loading="loading" type="submit" color="primary" block>Rejestracja</v-btn>
      <v-alert v-if="error" type="error" class="mt-2">{{ error }}</v-alert>
    </v-form>
  </v-container>
</template>
