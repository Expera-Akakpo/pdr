/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ADMIN_PATH?: string;
  readonly VITE_ADMIN_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
