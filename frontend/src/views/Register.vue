<!-- src/views/Register.vue -->
<template>
  <v-container fluid class="fill-height d-flex align-center justify-center">
    <v-card width="100%" max-width="500px" elevation="3" class="pa-4">
      <v-card-title class="text-h5">Rejestracja</v-card-title>
      <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
        <v-text-field
            label="Email"
            v-model="email"
            :rules="emailRules"
            required
        />
        <v-text-field
            label="Hasło"
            type="password"
            v-model="password"
            :rules="passwordRules"
            required
        />
        <v-btn :disabled="!valid || loading" color="primary" type="submit" block>
          <span v-if="!loading">Zarejestruj się</span>
          <v-progress-circular v-else indeterminate size="20" width="2" />
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');
const valid = ref(false);
const form = ref<any>(null);
const loading = ref(false);

const emailRules = [
  (v: string) => !!v || 'Email jest wymagany',
  (v: string) => /.+@.+\..+/.test(v) || 'Niepoprawny format email',
];

const passwordRules = [
  (v: string) => !!v || 'Hasło jest wymagane',
  (v: string) => v.length >= 6 || 'Hasło musi mieć min. 6 znaków',
];

/**
 * wysyła zapytanie do serwera o zapisanie danych
 */
async function onSubmit() {
  if (!form.value?.validate()) return;
  loading.value = true;
  try {
    await auth.register(email.value, password.value);
    await router.push('/profile');
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}
</script>
