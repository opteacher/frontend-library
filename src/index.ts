import { App } from 'vue'
import ColorSelect from './components/ColorSelect.vue'
import UploadFile from './components/UploadFile.vue'
import IconField from './components/IconField.vue'
import EditList from './components/EditList.vue'
import FormItem from './components/FormItem.vue'
import FormGroup from './components/FormGroup.vue'
import FormDialog from './components/FormDialog.vue'
import CodeEditor from './components/CodeEditor.vue'

const components = [
    ColorSelect,
    UploadFile,
    IconField,
    EditList,
    FormItem,
    FormGroup,
    FormDialog,
    CodeEditor
]

function install(app: App) {
    components.map(component => app.component(component.name, component))
}

export {
    ColorSelect,
    UploadFile,
    IconField,
    EditList,
    FormItem,
    FormGroup,
    FormDialog,
    CodeEditor
}

export default install
