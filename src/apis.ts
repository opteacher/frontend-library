import Compo from './types/compo'
import { reqAll } from './utils'

{
  component: {
    all: () => reqAll('component', { copy: Compo.copy })
  }
}
