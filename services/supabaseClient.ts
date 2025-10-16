
import { createClient } from '@supabase/supabase-js';

// As chaves são lidas das Variáveis de Ambiente (ex: em produção na Vercel).
// Os valores após '||' são fallbacks para o desenvolvimento local,
// garantindo que o app funcione mesmo sem um arquivo .env configurado.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://tqssfeblayfwzbwldbfc.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc3NmZWJsYXlmd3pid2xkYmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MzUwODQsImV4cCI6MjA3MzMxMTA4NH0.NZAJV69wj_eDnV8gJU5aseOXqhG0YobEF_t4z_AxKcU';


// A verificação explícita `if (!supabaseUrl ...)` foi removida porque os fallbacks
// garantem que as variáveis sempre terão um valor.
// É crucial configurar as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
// no seu ambiente de deploy (ex: Vercel) para usar as chaves de produção.


// Cria e exporta o cliente Supabase para ser usado em toda a aplicação.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
