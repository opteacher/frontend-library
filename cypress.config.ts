import { defineConfig } from 'cypress'
import task from '@cypress/code-coverage/task'

export default defineConfig({
  projectId: 'shncfc',
  viewportWidth: 1280,
  viewportHeight: 720,
  
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:4173'
  },

  component: {
    specPattern: 'src/tests/**/*.cy.{js,jsx,ts,tsx}',
    devServer: {
      framework: 'vue',
      bundler: 'vite'
    },
    setupNodeEvents(on, config) {
      task(on, config)
      // include any other plugin code...
      
      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config
    }
  }
})
