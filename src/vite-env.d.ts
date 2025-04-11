/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MQTT_URL: string
  readonly VITE_MQTT_CLIENT: string
  readonly VITE_MQTT_QOS: number
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
