function Dashboard({ user, profile, profileError, onLogout, logoutError, isLoggingOut }) {
  const displayName =
    profile?.display_name || user.user_metadata?.display_name || user.email

  return (
    <main className="app-shell dashboard">
      <section className="dashboard-card" aria-labelledby="dashboard-title">
        <p className="eyebrow">QuickPoll Dashboard</p>
        <h1 id="dashboard-title">QuickPoll</h1>
        <p className="description">Welcome to QuickPoll, {displayName}.</p>

        <div className="account-details" aria-label="Account details">
          <p>
            <span>Name</span>
            {displayName}
          </p>
          <p>
            <span>Email</span>
            {user.email}
          </p>
        </div>

        {profileError && <p className="form-message error">{profileError}</p>}
        {logoutError && <p className="form-message error">{logoutError}</p>}

        <p className="placeholder-message">
          Your polls will appear here in a future phase.
        </p>

        <button
          type="button"
          className="secondary-button"
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </section>
    </main>
  )
}

export default Dashboard
