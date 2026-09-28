import { useCallback, useEffect, useState } from 'react'
import PollDetail from './PollDetail'
import PollForm from './PollForm'
import {
  createPoll,
  deletePoll,
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
  const [copyMessage, setCopyMessage] = useState('')

  const loadPolls = useCallback(async () => {
    setIsLoadingPolls(true)
    setError('')

    try {
      const userPolls = await getUserPolls(user.id)
      setPolls(userPolls)
    } catch (loadError) {
      setError(loadError.message)
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

    try {
      const poll = await getPollWithOptions(pollId, user.id)
      setSelectedPoll(poll)
      setView('detail')
    } catch (detailError) {
      setError(detailError.message)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  async function handleCreatePoll(values) {
    const pollId = await createPoll(user.id, values)
    await loadPolls()
    await openPoll(pollId)
    setMessage('Poll created successfully.')
  }

  async function handleUpdatePoll(values) {
    await updatePoll(selectedPoll.id, user.id, values)
    await loadPolls()
    const refreshedPoll = await getPollWithOptions(selectedPoll.id, user.id)
    setSelectedPoll(refreshedPoll)
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
      setError(deleteError.message)
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
      setMessage('Poll published successfully.')
    } catch (publishError) {
      setError(publishError.message)
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
      setMessage('Poll unpublished successfully.')
    } catch (publishError) {
      setError(publishError.message)
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
      setView('edit')
    } catch (detailError) {
      setError(detailError.message)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  function startCreate() {
    setSelectedPoll(null)
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
    setView('dashboard')
    setError('')
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
          isDeleting={isDeleting}
          isPublishing={isPublishing}
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
