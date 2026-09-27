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

function setMessage(text) {
  message.textContent = text || ''
}

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
  setMessage('')
  submit.disabled = true
  signup.disabled = true
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value
    })
    if (error) throw error
  } catch (error) {
    console.error('Login failed', error)
    setMessage(error?.message || 'Não foi possível entrar. Confira e-mail e senha.')
  } finally {
    submit.disabled = false
    signup.disabled = false
  }
})

signup.addEventListener('click', async (event) => {
  event.preventDefault()
  setMessage('')
  const cleanEmail = email.value.trim()
  if (!cleanEmail || password.value.length < 6) {
    setMessage('Informe um e-mail e uma senha com pelo menos 6 caracteres.')
    return
  }

  signup.disabled = true
  submit.disabled = true
  setMessage('Criando conta…')
  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password.value,
      options: { data: { name: 'Gabriel Abdala' } }
    })
    if (error) throw error
    if (data.session) {
      setMessage('')
      showSession(data.session)
    } else {
      setMessage('Conta criada. Confirme o e-mail para entrar.')
    }
  } catch (error) {
    console.error('Signup failed', error)
    setMessage(error?.message || 'Não foi possível criar a conta.')
  } finally {
    signup.disabled = false
    submit.disabled = false
  }
})

signout.addEventListener('click', async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Signout failed', error)
    setMessage(error?.message || 'Não foi possível sair.')
  }
})

supabase.auth.onAuthStateChange((_event, session) => showSession(session))
currentSession().catch((error) => {
  console.error('Auth initialization failed', error)
  setMessage(error?.message || 'Não foi possível iniciar a autenticação.')
})
