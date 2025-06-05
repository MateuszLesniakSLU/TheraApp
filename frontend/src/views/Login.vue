<template>
  <v-container fluid class="fill-height d-flex align-center justify-center">
    <v-card width="100%" max-width="500px" elevation="3" class="pa-4">
      <v-card-title class="text-h5">Logowanie</v-card-title>
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
          <span v-if="!loading">Zaloguj się</span>
          <v-progress-circular v-else indeterminate size="20" width="2" />
        </v-btn>
        <div v-if="errorMsg" class="mt-2" style="color:red">{{ errorMsg }}</div>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const valid = ref(false);
const form = ref<any>(null);
const loading = ref(false);
const errorMsg = ref('');
const router = useRouter();

/**
 * Wymagania dot. emaila używanego do logowania
 */
const emailRules = [
  (v: string) => !!v || 'Email jest wymagany',
  (v: string) => /.+@.+\..+/.test(v) || 'Niepoprawny format email',
];

/**
 * zasady dot. logowania
 */
const passwordRules = [
  (v: string) => !!v || 'Hasło jest wymagane',
  (v: string) => v.length >= 6 || 'Hasło musi mieć min. 6 znaków',
];

/**
 * wysłanie danych wpisanych przez użytkownika w polach logowania.
 */
async function onSubmit() {
  if (!form.value?.validate()) return;
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });

    //Łapanie błędnych danych przy logowaniu
    if (!res.ok) {
      try {
        const err = await res.json();
        errorMsg.value = err.message || 'Błędny email lub hasło';
      } catch {
        errorMsg.value = 'Błędny email lub hasło';
      }
      return;
    }
    const data = await res.json();
    localStorage.setItem('token', data.access_token);

    //przekierowanie do /profile po zalogowaniu
    const profileRes = await fetch('/api/auth/profile', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    let isAdmin = false;
    if (profileRes.ok) {
      const profile = await profileRes.json();
      localStorage.setItem('user', JSON.stringify(profile));
      isAdmin = profile.role === 'admin';
    }

    if (isAdmin) {
      await router.push('/admin');
    } else {
      await router.push('/profile');
    }
    window.location.reload();
  } catch (e) {
    errorMsg.value = 'Błąd połączenia z serwerem';
    console.error(e);
  } finally {
    loading.value = false;
  }
}
</script>
