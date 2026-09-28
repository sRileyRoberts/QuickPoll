import { useEffect, useState } from 'react'
import './App.css'
import AuthForm from './components/AuthForm'
import Dashboard from './components/Dashboard'
import { supabase, supabaseConfig } from './lib/supabaseClient'

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState('')
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  useEffect(() => {
    if (!supabaseConfig.isConfigured || !supabase) {
      setIsAuthLoading(false)
      return undefined
    }

    let isMounted = true

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      if (error) {
        setLogoutError(error.message)
      }

      setSession(data.session)
      setIsAuthLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLogoutError('')
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabaseConfig.isConfigured || !supabase || !session?.user) {
      setProfile(null)
      setProfileError('')
      return undefined
    }

    let isMounted = true

    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!isMounted) {
        return
      }

      if (error) {
        setProfile(null)
        setProfileError('Profile details are unavailable right now. Using your account email instead.')
        return
      }

      setProfile(data)
      setProfileError('')
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [session])

  async function handleLogout() {
    if (!supabase) {
      return
    }

    setIsLoggingOut(true)
    setLogoutError('')

    const { error } = await supabase.auth.signOut()

    setIsLoggingOut(false)

    if (error) {
      setLogoutError(error.message)
    }
  }

  if (isAuthLoading) {
    return (
      <main className="app-shell">
        <section className="intro" aria-live="polite">
          <p className="eyebrow">QuickPoll</p>
          <h1>Loading...</h1>
          <p className="description">Checking your login session.</p>
        </section>
      </main>
    )
  }

  if (session?.user) {
    return (
      <Dashboard
        user={session.user}
        profile={profile}
        profileError={profileError}
        onLogout={handleLogout}
        logoutError={logoutError}
        isLoggingOut={isLoggingOut}
      />
    )
  }

  return (
    <main className="app-shell">
      <section className="intro" aria-labelledby="app-title">
        <p className="eyebrow">Engineering Design 2 Project</p>
        <h1 id="app-title">QuickPoll</h1>
        <p className="description">
          Create simple polls, share them, and view the results.
        </p>
      </section>

      {!supabaseConfig.isConfigured && (
        <section className="config-warning" aria-live="polite">
          <h2>Supabase setup needed</h2>
          <p>
            Add {supabaseConfig.missingVariables.join(' and ')} to a local
            .env file before using login or registration.
          </p>
        </section>
      )}

      <AuthForm isSupabaseConfigured={supabaseConfig.isConfigured} />
    </main>
  )
}

export default App
