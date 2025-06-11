<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const email = ref(auth.user?.email || '')
const firstName = ref(auth.user?.firstName || '')
const lastName = ref(auth.user?.lastName || '')
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

onMounted(() => {
  if (!auth.isAuthenticated) {
    auth.initFromStorage()
  }
  if (auth.user) {
    email.value = auth.user.email
    firstName.value = auth.user.firstName || ''
    lastName.value = auth.user.lastName || ''
  }
})

const save = async () => {
  loading.value = true
  error.value = ''
  success.value = false
  try {
    await auth.updateProfile({
      email: email.value,
      firstName: firstName.value,
      lastName: lastName.value,
      ...(password.value ? { password: password.value } : {})
    })
    success.value = true
    password.value = ''
  } catch (e: any) {
    error.value = e.message || 'Błąd aktualizacji profilu'
  }
  loading.value = false
}
</script>

<template>
  <v-container>
    <v-card class="mx-auto" style="max-width: 400px">
      <v-card-title>Profil użytkownika</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="save">
          <v-text-field v-model="email" label="E-mail" required></v-text-field>
          <v-text-field v-model="firstName" label="Imię"></v-text-field>
          <v-text-field v-model="lastName" label="Nazwisko"></v-text-field>
          <v-text-field v-model="password" label="Nowe hasło" type="password"></v-text-field>
          <v-btn :loading="loading" type="submit" color="primary" block>Zapisz zmiany</v-btn>
        </v-form>
        <v-alert v-if="error" type="error" class="mt-2">{{ error }}</v-alert>
        <v-alert v-if="success" type="success" class="mt-2">Profil zaktualizowany!</v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>
