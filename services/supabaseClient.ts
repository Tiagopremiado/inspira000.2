import { createClient } from '@supabase/supabase-js';

// Lê as variáveis de ambiente. Elas SÃO OBRIGATÓRIAS em qualquer ambiente.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Princípio "Fail Fast": Se as variáveis críticas não estiverem definidas,
// a aplicação deve quebrar imediatamente com uma mensagem de erro clara.
// Isso evita que a aplicação em produção se conecte acidentalmente
// a um banco de dados de desenvolvimento ou a lugar nenhum.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.');
}

// Para o desenvolvimento local, crie um arquivo .env na raiz do projeto com as chaves:
// VITE_SUPABASE_URL=SUA_URL
// VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON

// Cria e exporta o cliente Supabase para ser usado em toda a aplicação.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
