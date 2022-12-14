import Compo from './types/compo'
import { reqAll, reqGet } from './utils'

export default {
  component: {
    all: () => reqAll('component', { copy: Compo.copy }),
    get: (name: string) =>
      reqAll('component', { axiosConfig: { params: { name } } }).then(ress => ress[0])
  }
}
