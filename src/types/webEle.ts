export default interface PageEle {
  xpath: string
  clazz: string
  tagName: string
  rectBox: {
    x: number
    y: number
    width: number
    height: number
  }
}