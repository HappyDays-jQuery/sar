<template>
  <v-app>
    <v-content>
      <v-container fluid fill-height>
        <v-layout justify-center fluid column>
          <v-fade-transition mode="out-in">
            <router-view/>
          </v-fade-transition>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>

  export default {
  name: 'App',

  components: {},

  data: () => ({
    //
  }),
};
</script>
