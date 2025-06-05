<template>
  <v-container class="pa-4" max-width="600">
    <v-card v-if="user">
      <v-card-title>Profil użytkownika</v-card-title>
      <v-card-text>
        <div><strong>Imię:</strong> {{ user.firstName || '-' }}</div>
        <div><strong>Nazwisko:</strong> {{ user.lastName || '-' }}</div>
        <div><strong>Email:</strong> {{ user.email }}</div>
        <div><strong>Rola:</strong> {{ user.role }}</div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="edit = true">Edytuj dane</v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="edit" max-width="500">
      <v-card>
        <v-card-title>Edytuj profil</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.firstName" label="Imię" />
          <v-text-field v-model="form.lastName" label="Nazwisko" />
          <v-text-field v-model="form.email" label="Email" />
          <v-text-field v-model="form.password" label="Nowe hasło" type="password" hint="Pozostaw puste, jeśli nie zmieniasz"/>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="save">Zapisz</v-btn>
          <v-btn @click="edit = false">Anuluj</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';

const auth = useAuthStore();
const user = ref<null | { id: number; email: string; firstName?: string; lastName?: string; role?: string }>(null);
const edit = ref(false);
const form = ref({ email: '', firstName: '', lastName: '', password: '' });

/**
 * Ładuje cały profil
 */
async function loadProfile() {
  await auth.fetchProfile();
  user.value = auth.user;
  form.value.email = auth.user.email;
  form.value.firstName = auth.user.firstName || '';
  form.value.lastName = auth.user.lastName || '';
}

onMounted(loadProfile);

/**
 * Zapisuje zmiany do bazy
 */
async function save() {
  const payload: any = {
    email: form.value.email,
    firstName: form.value.firstName,
    lastName: form.value.lastName,
  };
  if (form.value.password) payload.password = form.value.password;

  await auth.updateProfile(payload);
  edit.value = false;
  await loadProfile();
}
</script>
