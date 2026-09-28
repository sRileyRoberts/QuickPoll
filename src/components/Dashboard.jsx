import { useCallback, useEffect, useState } from 'react'
import PollDetail from './PollDetail'
import PollForm from './PollForm'
import {
  createPoll,
  deletePoll,
  fetchPollResults,
  getPollWithOptions,
  getUserPolls,
  publishPoll,
  unpublishPoll,
  updatePoll,
} from '../lib/pollService'

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function Dashboard({ user, profile, profileError, onLogout, logoutError, isLoggingOut }) {
  const displayName =
    profile?.display_name || user.user_metadata?.display_name || user.email

  const [view, setView] = useState('dashboard')
  const [polls, setPolls] = useState([])
  const [selectedPoll, setSelectedPoll] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoadingPolls, setIsLoadingPolls] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const [copyMessage, setCopyMessage] = useState('')
  const [results, setResults] = useState(null)
  const [resultsError, setResultsError] = useState('')

  const shouldLockOptions = Boolean(resultsError) || (results?.totalVotes || 0) > 0

  const loadPolls = useCallback(async () => {
    setIsLoadingPolls(true)
    setError('')

    try {
      const userPolls = await getUserPolls(user.id)
      setPolls(userPolls)
    } catch (loadError) {
      console.error('Poll list loading failed:', loadError)
      setError('Your polls could not be loaded. Please try again.')
    } finally {
      setIsLoadingPolls(false)
    }
  }, [user.id])

  useEffect(() => {
    loadPolls()
  }, [loadPolls])

  async function openPoll(pollId) {
    setIsLoadingDetail(true)
    setError('')
    setMessage('')
    setResults(null)
    setResultsError('')

    try {
      const poll = await getPollWithOptions(pollId, user.id)
      setSelectedPoll(poll)
      setView('detail')
      await loadResults(pollId)
    } catch (detailError) {
      console.error('Poll detail loading failed:', detailError)
      setError('Poll details could not be loaded. Please try again.')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  async function loadResults(pollId) {
    setIsLoadingResults(true)
    setResultsError('')

    try {
      const pollResults = await fetchPollResults(pollId, user.id)
      setResults(pollResults)
      return pollResults
    } catch (resultError) {
      console.error('Result loading failed:', resultError)
      setResults(null)
      setResultsError('Results could not be loaded. Please try again.')
      return null
    } finally {
      setIsLoadingResults(false)
    }
  }

  async function handleCreatePoll(values) {
    const pollId = await createPoll(user.id, values)
    await loadPolls()
    await openPoll(pollId)
    setMessage('Poll created successfully.')
  }

  async function handleUpdatePoll(values) {
    await updatePoll(selectedPoll.id, user.id, values, {
      updateOptions: !shouldLockOptions,
    })
    await loadPolls()
    const refreshedPoll = await getPollWithOptions(selectedPoll.id, user.id)
    setSelectedPoll(refreshedPoll)
    await loadResults(selectedPoll.id)
    setView('detail')
    setMessage('Poll updated successfully.')
  }

  async function handleDeletePoll(poll = selectedPoll) {
    if (!poll) {
      return
    }

    const confirmed = window.confirm(
      `Delete "${poll.title}"? This will also delete its answer options.`,
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    setError('')
    setMessage('')

    try {
      await deletePoll(poll.id, user.id)
      setSelectedPoll(null)
      setView('dashboard')
      setMessage('Poll deleted successfully.')
      await loadPolls()
    } catch (deleteError) {
      console.error('Poll deletion failed:', deleteError)
      setError('The poll could not be deleted. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  async function refreshSelectedPoll(pollId) {
    const refreshedPoll = await getPollWithOptions(pollId, user.id)
    setSelectedPoll(refreshedPoll)
    return refreshedPoll
  }

  async function handlePublishPoll() {
    if (!selectedPoll) {
      return
    }

    setIsPublishing(true)
    setError('')
    setMessage('')
    setCopyMessage('')

    try {
      await publishPoll(selectedPoll.id, user.id)
      await loadPolls()
      await refreshSelectedPoll(selectedPoll.id)
      await loadResults(selectedPoll.id)
      setMessage('Poll published successfully.')
    } catch (publishError) {
      console.error('Poll publishing failed:', publishError)
      setError('The poll could not be published. Please try again.')
    } finally {
      setIsPublishing(false)
    }
  }

  async function handleUnpublishPoll() {
    if (!selectedPoll) {
      return
    }

    setIsPublishing(true)
    setError('')
    setMessage('')
    setCopyMessage('')

    try {
      await unpublishPoll(selectedPoll.id, user.id)
      await loadPolls()
      await refreshSelectedPoll(selectedPoll.id)
      await loadResults(selectedPoll.id)
      setMessage('Poll unpublished successfully.')
    } catch (publishError) {
      console.error('Poll unpublishing failed:', publishError)
      setError('The poll could not be unpublished. Please try again.')
    } finally {
      setIsPublishing(false)
    }
  }

  async function handleCopyShareLink() {
    if (!selectedPoll) {
      return
    }

    const shareUrl = `${window.location.origin}/poll/${selectedPoll.id}`
    setCopyMessage('')
    setError('')

    if (!navigator.clipboard?.writeText) {
      setCopyMessage('Copy is not available in this browser. You can select and copy the link manually.')
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopyMessage('Share link copied.')
    } catch {
      setCopyMessage('Copy failed. You can select and copy the link manually.')
    }
  }

  async function startEditFromList(pollId) {
    setIsLoadingDetail(true)
    setError('')
    setMessage('')

    try {
      const fullPoll = await getPollWithOptions(pollId, user.id)
      setSelectedPoll(fullPoll)
      await loadResults(pollId)
      setView('edit')
    } catch (detailError) {
      console.error('Poll edit loading failed:', detailError)
      setError('Poll details could not be loaded for editing. Please try again.')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  function startCreate() {
    setSelectedPoll(null)
    setResults(null)
    setResultsError('')
    setMessage('')
    setError('')
    setView('create')
  }

  function startEdit(poll = selectedPoll) {
    setSelectedPoll(poll)
    setMessage('')
    setError('')
    setView('edit')
  }

  function backToDashboard() {
    setSelectedPoll(null)
    setResults(null)
    setResultsError('')
    setView('dashboard')
    setError('')
  }

  async function handleRefreshResults() {
    if (!selectedPoll) {
      return
    }

    const refreshedResults = await loadResults(selectedPoll.id)

    if (refreshedResults) {
      setMessage('Results refreshed.')
    }
  }

  function renderWorkspace() {
    if (view === 'create') {
      return (
        <PollForm
          mode="create"
          onCancel={backToDashboard}
          onSubmit={handleCreatePoll}
        />
      )
    }

    if (view === 'edit' && selectedPoll) {
      return (
        <PollForm
          mode="edit"
          poll={selectedPoll}
          lockOptions={shouldLockOptions}
          optionLockReason={
            resultsError
              ? 'Answer options are locked because results could not be loaded. You can still edit the title, description, and question.'
              : 'Answer options are locked because this poll already has votes. You can still edit the title, description, and question.'
          }
          onCancel={() => setView('detail')}
          onSubmit={handleUpdatePoll}
        />
      )
    }

    if (view === 'detail' && selectedPoll) {
      return (
        <PollDetail
          poll={selectedPoll}
          onBack={backToDashboard}
          onEdit={() => startEdit(selectedPoll)}
          onDelete={() => handleDeletePoll(selectedPoll)}
          onPublish={handlePublishPoll}
          onUnpublish={handleUnpublishPoll}
          onCopyLink={handleCopyShareLink}
          shareUrl={`${window.location.origin}/poll/${selectedPoll.id}`}
          copyMessage={copyMessage}
          results={results}
          resultsError={resultsError}
          onRefreshResults={handleRefreshResults}
          isDeleting={isDeleting}
          isPublishing={isPublishing}
          isLoadingResults={isLoadingResults}
        />
      )
    }

    return (
      <section className="workspace-card" aria-labelledby="poll-list-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h2 id="poll-list-title">Your Polls</h2>
          </div>
          <button type="button" className="primary-button" onClick={startCreate}>
            Create Poll
          </button>
        </div>

        {isLoadingPolls && <p className="placeholder-message">Loading your polls...</p>}

        {!isLoadingPolls && polls.length === 0 && (
          <p className="placeholder-message">
            You do not have any polls yet. Create your first draft poll to get started.
          </p>
        )}

        {!isLoadingPolls && polls.length > 0 && (
          <div className="poll-list">
            {polls.map((poll) => (
              <article className="poll-card" key={poll.id}>
                <div>
                  <p className="status-label">{poll.is_published ? 'Published' : 'Draft'}</p>
                  <h3>{poll.title}</h3>
                  <p>{poll.question}</p>
                  <span>Created {formatDate(poll.created_at)}</span>
                </div>
                <div className="poll-card-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => openPoll(poll.id)}
                    disabled={isLoadingDetail}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => startEditFromList(poll.id)}
                    disabled={isLoadingDetail}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDeletePoll(poll)}
                    disabled={isDeleting}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <main className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <p className="eyebrow">QuickPoll</p>
        <h1>Dashboard</h1>
        <p className="description">Welcome, {displayName}.</p>

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

        <button
          type="button"
          className="secondary-button"
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </aside>

      <div className="dashboard-workspace">
        {message && <p className="form-message success">{message}</p>}
        {error && <p className="form-message error">{error}</p>}
        {isLoadingDetail && <p className="placeholder-message">Loading poll details...</p>}
        {renderWorkspace()}
      </div>
    </main>
  )
}

export default Dashboard
