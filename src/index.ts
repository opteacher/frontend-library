import { App } from 'vue'
import ColorSelect from './components/ColorSelect.vue'
import UploadFile from './components/UploadFile.vue'
import IconField from './components/IconField.vue'
import EditList from './components/EditList.vue'
import FormItem from './components/FormItem.vue'
import FormGroup from './components/FormGroup.vue'
import FormDialog from './components/FormDialog.vue'
import CodeEditor from './components/CodeEditor.vue'
import JsonEditor from './components/JsonEditor.vue'
import EditableTable from './components/EditableTable.vue'
import BchExpBox from './components/BchExpBox.vue'
import BchImpBox from './components/BchImpBox.vue'
import CButton from './components/CButton.vue'
import OptSclPnl from './components/OptSclPnl.vue'
import IpAddrInput from './components/IpAddrInput.vue'

export const components = {
    ColorSelect,
    UploadFile,
    IconField,
    EditList,
    FormItem,
    FormGroup,
    FormDialog,
    CodeEditor,
    JsonEditor,
    EditableTable,
    BchExpBox,
    BchImpBox,
    CButton,
    OptSclPnl,
    IpAddrInput
}

export default function (app: App) {
    Object.values(components).map(component => app.component(component.name || component.__name as string, component))
}
