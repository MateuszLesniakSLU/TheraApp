<template>
  <v-container class="py-8">
    <v-card elevation="4" class="rounded-2xl pa-6">
      <v-card-title class="text-h5 font-weight-bold mb-4">Panel Administratora</v-card-title>
      <v-data-table
          :headers="headers"
          :items="users"
          :items-per-page="8"
          :loading="loading"
          class="elevation-1 rounded-lg"
          no-data-text="Brak użytkowników"
      >
        <template #item.email="{ item }">
          <span v-if="editId !== item.id">{{ item.email }}</span>
          <v-text-field
              v-else
              v-model="editData.email"
              variant="outlined"
              density="compact"
              hide-details
              style="max-width: 220px"
          />
        </template>

        <template #item.firstName="{ item }">
          <span v-if="editId !== item.id">
            {{ item.admin?.firstName || item.therapist?.firstName || item.patient?.firstName || '-' }}
          </span>
          <v-text-field
              v-else
              v-model="editData.firstName"
              variant="outlined"
              density="compact"
              hide-details
              style="max-width: 130px"
          />
        </template>

        <template #item.lastName="{ item }">
          <span v-if="editId !== item.id">
            {{ item.admin?.lastName || item.therapist?.lastName || item.patient?.lastName || '-' }}
          </span>
          <v-text-field
              v-else
              v-model="editData.lastName"
              variant="outlined"
              density="compact"
              hide-details
              style="max-width: 130px"
          />
        </template>

        <template #item.role="{ item }">
          <span v-if="editId !== item.id">{{ rolaLabel(item.role) }}</span>
          <v-select
              v-else
              v-model="editData.role"
              :items="roleOptions"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 150px"
          />
        </template>

        <template #item.isActive="{ item }">
          <v-chip :color="item.isActive ? 'success' : 'error'" variant="flat">
            {{ item.isActive ? 'Aktywny' : 'Zablokowany' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-row dense class="flex-nowrap align-center ga-1">
            <v-btn
                v-if="editId !== item.id"
                variant="tonal"
                size="small"
                color="info"
                @click="startEdit(item)"
            >
              <v-icon start>mdi-pencil</v-icon>
              Edytuj
            </v-btn>

            <v-btn
                v-if="editId === item.id"
                color="primary"
                variant="tonal"
                size="small"
                @click="saveEdit(item.id)"
            >
              <v-icon left>mdi-content-save</v-icon>Zapisz
            </v-btn>

            <v-btn
                v-if="editId === item.id"
                color="grey"
                variant="tonal"
                size="small"
                @click="cancelEdit"
            >
              <v-icon left>mdi-close</v-icon>Anuluj
            </v-btn>

            <v-btn
                v-if="item.isActive && editId !== item.id"
                color="warning"
                variant="tonal"
                size="small"
                @click="blockUser(item.id)"
            >
              Zablokuj
            </v-btn>

            <v-btn
                v-if="!item.isActive && editId !== item.id"
                color="success"
                variant="tonal"
                size="small"
                @click="unblockUser(item.id)"
            >
              Odblokuj
            </v-btn>

            <v-btn
                v-if="editId !== item.id"
                color="error"
                variant="tonal"
                size="small"
                @click="removeUser(item.id)"
            >
              <v-icon left>mdi-delete</v-icon>Usuń
            </v-btn>

            <v-btn
                v-if="editId !== item.id"
                color="secondary"
                variant="tonal"
                size="small"
                @click="showLogs(item.id)"
            >
              <v-icon start>mdi-file-document-outline</v-icon>
              Logi
            </v-btn>
          </v-row>
        </template>
      </v-data-table>
    </v-card>

    <!-- LOGI UŻYTKOWNIKA -->
    <v-dialog v-model="logsDialog" max-width="800px">
      <v-card>
        <v-card-title>
          Logi użytkownika {{ selectedUserId }}
          <v-spacer/>
          <v-btn icon @click="logsDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <h3>Logowanie</h3>
              <v-table density="compact">
                <thead>
                <tr>
                  <th>Typ</th>
                  <th>Data</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="log in allLogs.logins" :key="log.id">
                  <td>
                    <span v-if="log.action === 'login_success'">Zalogował się</span>
                    <span v-else-if="log.action === 'login_failed'">Nieudana próba</span>
                    <span v-else>Konto zablokowane</span>
                  </td>
                  <td>{{ formatDate(log.timestamp) }}</td>
                </tr>
                </tbody>
              </v-table>
            </v-col>
            <v-col cols="12" md="6">
              <h3>Zmiany</h3>
              <v-table density="compact">
                <thead>
                <tr>
                  <th>Opis</th>
                  <th>Kto zmienił (id)</th>
                  <th>Data</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="log in allLogs.changes" :key="log.id">
                  <td>
                    <template v-if="parseDetails(log).updatedFields && (parseDetails(log).before || parseDetails(log).after)">
                      <div v-for="field in parseDetails(log).updatedFields" :key="field">
                          <span>
                            Zmienił {{ field }}
                            z <b>{{ parseDetails(log).before?.[field] ?? '-' }}</b>
                            na <b>{{ parseDetails(log).after?.[field] ?? '-' }}</b>
                          </span>
                      </div>
                    </template>
                    <span v-else>Zmiana profilu</span>
                  </td>
                  <td>
                    {{ (typeof log.performedById === 'number' && log.performedById > 0) ? log.performedById : '-' }}
                  </td>
                  <td>{{ formatDate(log.timestamp) }}</td>
                </tr>
                </tbody>
              </v-table>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const allLogs = ref({ logins: [], changes: [] })
const editData = ref({ email: '', role: '', firstName: '', lastName: '' })
const editId = ref(null)
const loading = ref(false)
const logsDialog = ref(false)
const selectedUserId = ref(null)
const users = ref([])

const headers = [
  { title: 'Email', key: 'email', align: 'start' },
  { title: 'Imię', key: 'firstName', align: 'start' },
  { title: 'Nazwisko', key: 'lastName', align: 'start' },
  { title: 'Rola', key: 'role', align: 'start' },
  { title: 'Status', key: 'isActive', align: 'center' },
  { title: 'Akcje', key: 'actions', align: 'center', sortable: false }
]

const roleOptions = [
  { title: 'Administrator', value: 'admin' },
  { title: 'Terapeuta', value: 'therapist' },
  { title: 'Pacjent', value: 'patient' }
]

const rolaLabel = (r) => {
  if (r === 'admin') return 'Administrator'
  if (r === 'therapist') return 'Terapeuta'
  if (r === 'patient') return 'Pacjent'
  return r
}

/**
 * Pobieranie użytkowników
 * @returns {Promise<*[]>}
 */
const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!res.ok) return users.value = []
    users.value = await res.json()
  } finally {
    loading.value = false
  }
}

/**
 * Blokada użytkownika
 * @param id
 * @returns {Promise<void>}
 */
const blockUser = async (id) => {
  await fetch(`/api/users/${id}/block`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  await fetchUsers();
};

/**
 * Odblokowywanie użytkownika
 * @param id
 * @returns {Promise<void>}
 */
const unblockUser = async (id) => {
  await fetch(`/api/users/${id}/unblock`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  await fetchUsers();
};

/**
 * Usuwanie użytkownika
 * @param id
 * @returns {Promise<void>}
 */
const removeUser = async (id) => {
  if (!confirm('Na pewno usunąć to konto?')) return;
  await fetch(`/api/users/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  await fetchUsers();
};

/**
 * Rozpoczęcie formularzu edycji
 * @param user
 */
const startEdit = (user) => {
  editId.value = user.id
  editData.value = {
    email: user.email,
    role: user.role,
    firstName: user.admin?.firstName || user.therapist?.firstName || user.patient?.firstName || '',
    lastName: user.admin?.lastName || user.therapist?.lastName || user.patient?.lastName || ''
  }
}

/**
 * Anulacja formularza edycji oraz zmian które zostały wprowadzone, ale niezapisane
 */
const cancelEdit = () => {
  editId.value = null
  editData.value = { email: '', role: '', firstName: '', lastName: '' }
}

/**
 * Zapis zmian do bazy, wysłanie do api
 * @param id
 * @returns {Promise<void>}
 */
const saveEdit = async (id) => {
  const user = users.value.find(u => u.id === id)
  let url, body

  if (user.role === 'admin' && user.admin) {
    url = `/api/admins/${user.admin.id}`;
    body = {
      firstName: editData.value.firstName,
      lastName: editData.value.lastName
    }
  }
  if (user.role === 'therapist' && user.therapist) {
    url = `/api/therapists/${user.therapist.id}`;
    body = {
      firstName: editData.value.firstName,
      lastName: editData.value.lastName
    }
  }
  if (user.role === 'patient' && user.patient) {
    url = `/api/patients/${user.patient.id}`;
    body = {
      firstName: editData.value.firstName,
      lastName: editData.value.lastName
    }
  }

  if (!url) return

  await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(body)
  });

  cancelEdit();
  await fetchUsers();
}

/**
 * Parsowanie danych do logów
 * @param log
 * @returns {{}|any|{}}
 */
const parseDetails = (log) => {
  try {
    return log && log.details ? JSON.parse(log.details) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Pokazanie logów dot. konkretnego Id w liście
 * @param userId
 * @returns {Promise<void>}
 */
const showLogs = async (userId) => {
  selectedUserId.value = userId
  logsDialog.value = true
  const res = await fetch(`/api/admin-logs/user/${userId}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  })
  allLogs.value = await res.json()
}

/**
 * Data kiedy wprowadzono zmiany
 * @param d
 * @returns {string}
 */
const formatDate = d =>
    new Date(d).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })

onMounted(fetchUsers)
</script>
