/// <reference types="vite/client" />

// si quieres tipar explícitamente tus vars:
interface ImportMetaEnv {
  readonly VITE_API_BASE: string
  // añadir aquí más VITE_… si los necesitas
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
