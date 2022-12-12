import { App } from 'vue'
import ColorSelect from './components/ColorSelect.vue'
import UploadFile from './components/UploadFile.vue'

const components = [
    ColorSelect,
    UploadFile
]

function install(app: App) {
    components.map(component => app.component(component.name, component))
}

export {
    ColorSelect,
    UploadFile
}

export default install