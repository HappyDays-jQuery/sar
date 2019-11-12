export default {
  methods: {
    debug(obj) {
      if (process.env.VUE_APP_DEBUG === 'true') {
        // eslint-disable-next-line no-console
        console.log(obj)
      }
    }
  }
}
