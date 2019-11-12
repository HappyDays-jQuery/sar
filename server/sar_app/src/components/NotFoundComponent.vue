<template>
    <v-content>
        <v-container fluid fill-height>
            <v-layout justify-center fluid>
                <v-flex xs12 offset-mx5>
                    Not found.
                </v-flex>
            </v-layout>
        </v-container>
    </v-content>
</template>

<script>
  export default {
    data: () => ({}),

    props: {},

    created() {
      this.debug('Hot Found Component created.')
      this.initialize()
    },

    mounted() {
      this.debug('Not Found Component mounted.')
    },

    methods: {
      initialize: function () {
      },
    },

  }
</script>
