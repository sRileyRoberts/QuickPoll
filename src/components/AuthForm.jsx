import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function AuthForm({ isSupabaseConfigured }) {
  const [mode, setMode] = useState('login')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRegistering = mode === 'register'

  function resetFormMessages() {
    setMessage('')
    setError('')
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setPassword('')
    setConfirmPassword('')
    resetFormMessages()
  }

  function validateForm() {
    const trimmedEmail = email.trim()

    if (isRegistering && !displayName.trim()) {
      return 'Please enter your display name.'
    }

    if (!trimmedEmail || !password) {
      return 'Please enter your email and password.'
    }

    if (!emailPattern.test(trimmedEmail)) {
      return 'Please enter a valid email address.'
    }

    if (isRegistering && !confirmPassword) {
      return 'Please confirm your password.'
    }

    if (isRegistering && password !== confirmPassword) {
      return 'Passwords do not match.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    resetFormMessages()

    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured yet. Add your project URL and anon key to a local .env file.')
      return
    }

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    if (isRegistering) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
        },
      })

      setIsSubmitting(false)

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      setPassword('')
      setConfirmPassword('')

      if (data.session) {
        setMessage('Account created. You are now signed in.')
      } else {
        setMessage('Account created. Check your email to confirm your account before logging in.')
      }

      return
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setIsSubmitting(false)

    if (loginError) {
      setError(loginError.message)
      return
    }

    setPassword('')
    setMessage('Logged in successfully.')
  }

  return (
    <section className="auth-panel" aria-label="Authentication">
      <div className="auth-tabs" role="tablist" aria-label="Authentication options">
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => switchMode('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'active' : ''}
          onClick={() => switchMode('register')}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {isRegistering && (
          <label>
            Display name
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="name"
              disabled={isSubmitting}
              required
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            disabled={isSubmitting}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            disabled={isSubmitting}
            required
          />
        </label>

        {isRegistering && (
          <label>
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              disabled={isSubmitting}
              required
            />
          </label>
        )}

        {error && <p className="form-message error">{error}</p>}
        {message && <p className="form-message success">{message}</p>}

        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait...' : isRegistering ? 'Create account' : 'Login'}
        </button>
      </form>
    </section>
  )
}

export default AuthForm
