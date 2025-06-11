<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/auth'

const users = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const auth = useAuthStore()

const showEditDialog = ref(false)
const userToEdit = ref<any | null>(null)
const editLoading = ref(false)
const editError = ref('')

const fetchUsers = async () => {
  loading.value = true
  try {
    let res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      credentials: 'include'
    })
    if (res.status === 401) {
      await auth.refreshToken()
      res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        credentials: 'include'
      })
    }
    if (!res.ok) throw new Error(await res.text())
    users.value = await res.json()
  } catch (e: any) {
    error.value = e.message || 'Błąd pobierania użytkowników'
  }
  loading.value = false
}

const editUser = (user: any) => {
  userToEdit.value = { ...user }
  editError.value = ''
  showEditDialog.value = true
}

const saveEdit = async () => {
  if (!userToEdit.value) return
  editLoading.value = true
  editError.value = ''
  try {
    let res = await fetch(`${import.meta.env.VITE_API_URL}/users/${userToEdit.value.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.accessToken}`
      },
      credentials: 'include',
      body: JSON.stringify({
        email: userToEdit.value.email,
        role: userToEdit.value.role,
        isActive: userToEdit.value.isActive
      })
    })
    if (res.status === 401) {
      await auth.refreshToken()
      return saveEdit()
    }
    if (!res.ok) throw new Error(await res.text())
    showEditDialog.value = false
    await fetchUsers()
  } catch (e: any) {
    editError.value = e.message || 'Błąd zapisu'
  }
  editLoading.value = false
}

onMounted(fetchUsers)
</script>

<template>
  <v-container>
    <v-card class="mx-auto" style="max-width: 900px">
      <v-card-title>Panel administratora</v-card-title>
      <v-card-text>
        <v-alert v-if="error" type="error">{{ error }}</v-alert>
        <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
        <v-table v-if="users.length">
          <thead>
          <tr>
            <th>Email</th>
            <th>Rola</th>
            <th>Aktywny</th>
            <th>Akcje</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.email }}</td>
            <td>{{ u.role }}</td>
            <td>{{ u.isActive ? 'tak' : 'nie' }}</td>
            <td>
              <v-btn size="small" color="primary" @click="editUser(u)">Edytuj</v-btn>
            </td>
          </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Dialog edycji użytkownika -->
    <v-dialog v-model="showEditDialog" max-width="400">
      <v-card>
        <v-card-title>Edycja użytkownika</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveEdit">
            <v-text-field v-model="userToEdit.email" label="E-mail" />
            <v-select
                v-model="userToEdit.role"
                :items="['ADMIN', 'THERAPIST', 'PATIENT']"
                label="Rola"
            />
            <v-switch v-model="userToEdit.isActive" label="Aktywny" />
            <v-alert v-if="editError" type="error" class="mt-2">{{ editError }}</v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" :loading="editLoading" @click="saveEdit">Zapisz</v-btn>
          <v-btn text @click="showEditDialog = false">Anuluj</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
