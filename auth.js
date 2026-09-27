import { supabase } from './supabase-client.js'

const gate = document.getElementById('auth-gate')
const app = document.getElementById('app-shell')
const form = document.getElementById('auth-form')
const email = document.getElementById('auth-email')
const password = document.getElementById('auth-password')
const confirmPassword = document.getElementById('auth-confirm')
const confirmLabel = document.getElementById('auth-confirm-label')
const message = document.getElementById('auth-message')
const submit = document.getElementById('auth-submit')
const switchMode = document.getElementById('auth-switch')
const title = document.getElementById('auth-title')
const copy = document.getElementById('auth-copy')
const kicker = document.getElementById('auth-kicker')
const signout = document.getElementById('auth-signout')
let mode = 'login'

function setMessage(text, kind = '') {
  message.textContent = text || ''
  message.dataset.kind = kind
}
function setBusy(busy) {
  submit.disabled = busy
  switchMode.disabled = busy
}
function renderMode() {
  const creating = mode === 'signup'
  kicker.textContent = creating ? 'PRIMEIRO ACESSO' : 'BEM-VINDO DE VOLTA'
  title.textContent = creating ? 'Comece sua jornada.' : 'Continue sua jornada.'
  copy.textContent = creating ? 'Crie a conta que vai guardar seu progresso.' : 'Entre com sua conta para continuar de onde parou.'
  submit.textContent = creating ? 'Criar minha conta' : 'Entrar'
  switchMode.innerHTML = creating ? 'Já tem conta? <b>Entrar</b>' : 'Primeiro acesso? <b>Criar conta</b>'
  confirmPassword.hidden = !creating
  confirmLabel.hidden = !creating
  confirmPassword.required = creating
  password.autocomplete = creating ? 'new-password' : 'current-password'
  setMessage('')
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
function validate() {
  const cleanEmail = email.value.trim()
  if (!cleanEmail || !email.validity.valid) return 'Digite um e-mail válido.'
  if (password.value.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.'
  if (mode === 'signup' && password.value !== confirmPassword.value) return 'As senhas não são iguais.'
  return ''
}
async function currentSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  showSession(data.session)
}

switchMode.addEventListener('click', () => {
  mode = mode === 'login' ? 'signup' : 'login'
  renderMode()
  ;(mode === 'signup' ? confirmPassword : password).value = ''
})

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  const problem = validate()
  if (problem) { setMessage(problem, 'error'); return }
  setBusy(true)
  setMessage(mode === 'signup' ? 'Criando sua conta…' : 'Entrando…', 'working')
  try {
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: email.value.trim(),
        password: password.value,
        options: { data: { name: 'Gabriel Abdala' } }
      })
      if (error) throw error
      if (data.session) {
        showSession(data.session)
      } else {
        mode = 'login'
        renderMode()
        setMessage('Conta criada. Confira seu e-mail para confirmar o acesso.', 'success')
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value.trim(),
        password: password.value
      })
      if (error) throw error
      if (data.session) showSession(data.session)
    }
  } catch (error) {
    console.error('Authentication failed', error)
    const raw = String(error?.message || '')
    const friendly = /invalid login/i.test(raw) ? 'E-mail ou senha incorretos.'
      : /already registered/i.test(raw) ? 'Este e-mail já tem uma conta. Entre com sua senha.'
      : /rate limit/i.test(raw) ? 'Muitas tentativas seguidas. Aguarde um instante e tente novamente.'
      : raw || 'Não foi possível concluir. Tente novamente.'
    setMessage(friendly, 'error')
  } finally {
    setBusy(false)
  }
})

signout.addEventListener('click', async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Signout failed', error)
  }
})

supabase.auth.onAuthStateChange((_event, session) => showSession(session))
renderMode()
currentSession().catch((error) => {
  console.error('Auth initialization failed', error)
  setMessage(error?.message || 'Não foi possível iniciar a autenticação.', 'error')
})
