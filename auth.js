import { supabase } from './supabase-client.js'

const gate = document.getElementById('auth-gate')
const app = document.getElementById('app-shell')
const form = document.getElementById('auth-form')
const email = document.getElementById('auth-email')
const password = document.getElementById('auth-password')
const message = document.getElementById('auth-message')
const submit = document.getElementById('auth-submit')
const signup = document.getElementById('auth-signup')
const signout = document.getElementById('auth-signout')

function showSession(session) {
  const loggedIn = Boolean(session?.user)
  gate.hidden = loggedIn
  app.hidden = !loggedIn
  signout.hidden = !loggedIn
  document.documentElement.dataset.auth = loggedIn ? 'in' : 'out'
  window.ETR_USER = session?.user || null
  window.dispatchEvent(new CustomEvent('etr:auth', { detail: { session } }))
}

async function currentSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  showSession(data.session)
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  message.textContent = ''
  submit.disabled = true
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value
  })
  if (error) message.textContent = 'Não foi possível entrar. Confira e-mail e senha.'
  submit.disabled = false
})

signup.addEventListener('click', async () => {
  message.textContent = ''
  if (!email.value.trim() || password.value.length < 6) {
    message.textContent = 'Informe um e-mail e uma senha com pelo menos 6 caracteres.'
    return
  }
  signup.disabled = true
  const { data, error } = await supabase.auth.signUp({
    email: email.value.trim(),
    password: password.value
  })
  if (error) message.textContent = error.message
  else if (!data.session) message.textContent = 'Conta criada. Confirme o e-mail para entrar.'
  signup.disabled = false
})

signout.addEventListener('click', async () => {
  await supabase.auth.signOut()
})

supabase.auth.onAuthStateChange((_event, session) => showSession(session))
currentSession().catch((error) => {
  console.error(error)
  message.textContent = 'Não foi possível iniciar a autenticação.'
})
