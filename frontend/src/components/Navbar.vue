/**
* Komponent Navbar - prosty pasek nawigacyjny z dopasowaniem w zależności od roli, np. Panel Admina jeżeli auth.user?.role === 'admin'
*/
<template>
  <v-app-bar app>
    <v-toolbar-title>Therapy App</v-toolbar-title>
    <v-spacer />

    <div v-if="!auth.isAuthenticated">
      <router-link to="/login">
        <v-btn text>Login</v-btn>
      </router-link>
      <router-link to="/register">
        <v-btn text>Register</v-btn>
      </router-link>
    </div>

    <div v-else>
      <router-link v-if="auth.user?.role === 'admin'" to="/admin">
        <v-btn text color="primary">Panel Admina</v-btn>
      </router-link>
      <router-link to="/profile">
        <v-btn text>Profile</v-btn>
      </router-link>
      <v-btn text @click="auth.logout">Logout</v-btn>
    </div>
  </v-app-bar>
</template>

<script setup>
import { useAuthStore } from '../store/auth';
const auth = useAuthStore();
</script>
