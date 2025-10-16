/// <reference types="vite/client" />

// Este arquivo adiciona tipagens para as variáveis de ambiente
// que são acessadas através de `import.meta.env`.
// Isso permite que o TypeScript entenda `import.meta.env.VITE_...` sem erros.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
