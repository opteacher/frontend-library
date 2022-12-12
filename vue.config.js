module.exports = {
  devServer: {
    proxy: {
      '/server-package/(mdl|api)': {
        target: 'http://opteacher.top',
        ws: true,
        changeOrigin: true
      }
    }
  }
}
