import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchPublicPoll, submitVote } from '../lib/pollService'
import { supabaseConfig } from '../lib/supabaseClient'

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function getVotedStorageKey(pollId) {
  return `quickpoll_voted_${pollId}`
}

function hasStoredVote(pollId) {
  try {
    return localStorage.getItem(getVotedStorageKey(pollId)) === 'true'
  } catch {
    return false
  }
}

function storeVote(pollId) {
  try {
    localStorage.setItem(getVotedStorageKey(pollId), 'true')
  } catch {
    // localStorage is a convenience guard only. The submitted vote still counts.
  }
}

function PublicPollPage() {
  const { pollId } = useParams()
  const [poll, setPoll] = useState(null)
  const [selectedOptionId, setSelectedOptionId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voteError, setVoteError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadPublicPoll() {
      setIsLoading(true)
      setIsUnavailable(false)
      setVoteError('')
      setSelectedOptionId('')
      setHasVoted(hasStoredVote(pollId))

      if (!supabaseConfig.isConfigured || !uuidPattern.test(pollId || '')) {
        setPoll(null)
        setIsUnavailable(true)
        setIsLoading(false)
        return
      }

      try {
        const publicPoll = await fetchPublicPoll(pollId)

        if (!isMounted) {
          return
        }

        setPoll(publicPoll)
        setIsUnavailable(!publicPoll)
      } catch {
        if (!isMounted) {
          return
        }

        setPoll(null)
        setIsUnavailable(true)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPublicPoll()

    return () => {
      isMounted = false
    }
  }, [pollId])

  async function handleVoteSubmit(event) {
    event.preventDefault()
    setVoteError('')

    if (!selectedOptionId) {
      setVoteError('Please choose an answer before submitting your vote.')
      return
    }

    setIsSubmitting(true)

    try {
      await submitVote(poll.id, selectedOptionId)
      storeVote(poll.id)
      setHasVoted(true)
    } catch (error) {
      console.error('Vote submission failed:', error)
      setVoteError('Your vote could not be submitted. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="public-layout">
        <section className="workspace-card public-card" aria-live="polite">
          <p className="eyebrow">QuickPoll</p>
          <h1>Loading...</h1>
          <p className="description">Opening this poll.</p>
        </section>
      </main>
    )
  }

  if (isUnavailable) {
    return (
      <main className="public-layout">
        <section className="workspace-card public-card">
          <p className="eyebrow">QuickPoll</p>
          <h1>Poll Unavailable</h1>
          <p className="description">This poll is unavailable.</p>
          <Link className="button-link" to="/">
            Return to QuickPoll
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="public-layout">
      <section className="workspace-card public-card" aria-labelledby="public-poll-title">
        <p className="eyebrow">QuickPoll</p>
        <h1 id="public-poll-title">{poll.title}</h1>
        {poll.description && <p className="poll-description">{poll.description}</p>}

        <div className="detail-block">
          <span>Question</span>
          <p>{poll.question}</p>
        </div>

        {hasVoted ? (
          <p className="form-message success">Thanks for voting! Your vote has already been submitted.</p>
        ) : (
          <form className="vote-form" onSubmit={handleVoteSubmit}>
            <fieldset>
              <legend>Answer Options</legend>
              <div className="vote-options">
                {poll.options.map((option) => (
                  <label
                    className={
                      selectedOptionId === option.id
                        ? 'vote-option selected'
                        : 'vote-option'
                    }
                    key={option.id}
                  >
                    <input
                      type="radio"
                      name="poll-option"
                      value={option.id}
                      checked={selectedOptionId === option.id}
                      onChange={(event) => setSelectedOptionId(event.target.value)}
                      disabled={isSubmitting}
                    />
                    <span>{option.option_text}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {voteError && <p className="form-message error">{voteError}</p>}

            <button
              type="submit"
              className="primary-button"
              disabled={!selectedOptionId || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Vote'}
            </button>
          </form>
        )}

        <Link className="button-link" to="/">
          Return to QuickPoll
        </Link>
      </section>
    </main>
  )
}

export default PublicPollPage
