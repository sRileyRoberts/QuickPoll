import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchPublicPoll } from '../lib/pollService'
import { supabaseConfig } from '../lib/supabaseClient'

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function PublicPollPage() {
  const { pollId } = useParams()
  const [poll, setPoll] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUnavailable, setIsUnavailable] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadPublicPoll() {
      setIsLoading(true)
      setIsUnavailable(false)

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

        <div className="detail-block">
          <span>Answer Options</span>
          <ol className="option-list">
            {poll.options.map((option) => (
              <li key={option.id}>{option.option_text}</li>
            ))}
          </ol>
        </div>

        <p className="placeholder-message">
          Voting will be added in a future phase. This public page is read-only for now.
        </p>

        <Link className="button-link" to="/">
          Return to QuickPoll
        </Link>
      </section>
    </main>
  )
}

export default PublicPollPage
