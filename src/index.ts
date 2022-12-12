import { App } from 'vue'
import ColorSelect from './components/ColorSelect.vue'
import UploadFile from './components/UploadFile.vue'
import IconField from './components/IconField.vue'

const components = [
    ColorSelect,
    UploadFile,
    IconField
]

function install(app: App) {
    components.map(component => app.component(component.name, component))
}

export {
    ColorSelect,
    UploadFile,
    IconField
}

export default install