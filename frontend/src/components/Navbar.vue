<script setup lang="ts">
import { useAuthStore } from '../store/auth'
import { computed } from 'vue'

const auth = useAuthStore()
const isAuthenticated = computed(() => auth.isAuthenticated)
const userRole = computed(() => auth.userRole)
const logout = () => auth.logout()
</script>

<template>
  <v-app-bar color="primary" dark>
    <v-toolbar-title>TheraApp</v-toolbar-title>
    <v-spacer></v-spacer>
    <template v-if="isAuthenticated">
      <v-btn text to="/profile">Profil</v-btn>
      <v-btn text to="/admin" v-if="userRole === 'ADMIN'">Panel Administratora</v-btn>
      <v-btn text @click="logout">Wyloguj</v-btn>
    </template>
    <template v-else>
      <v-btn text to="/login">Logowanie</v-btn>
      <v-btn text to="/register">Rejestracja</v-btn>
    </template>
  </v-app-bar>
</template>
