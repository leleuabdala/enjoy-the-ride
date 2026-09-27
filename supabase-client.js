const url = 'https://xebkjibiuvxesmazycew.supabase.co'
const key = 'sb_publishable_Xm9YIwelIzPqIjGddsxGnA_eWKEmwhH'

if (!window.supabase?.createClient) {
  throw new Error('Supabase SDK não carregou.')
}

export const supabase = window.supabase.createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
})
