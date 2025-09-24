import { type App } from 'vue'
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
import TagList from './components/TagList.vue'
import BchExpBox from './components/BatExpBox.vue'
import BchImpBox from './components/BatImpBox.vue'
import CButton from './components/CButton.vue'
import OptSclPnl from './components/OptSclPnl.vue'
import IpAddrInput from './components/IpAddrInput.vue'
import FlexDivider from './components/FlexDivider.vue'

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
    TagList,
    BchExpBox,
    BchImpBox,
    CButton,
    OptSclPnl,
    IpAddrInput,
    FlexDivider
}

export default function (app: App) {
    Object.values(components).map(component => app.component(component.name || component.__name as string, component))
}
