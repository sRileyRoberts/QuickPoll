function formatDate(value) {
  return new Date(value).toLocaleString()
}

function PollDetail({
  poll,
  onBack,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onCopyLink,
  shareUrl,
  copyMessage,
  results,
  resultsError,
  onRefreshResults,
  isDeleting,
  isPublishing,
  isLoadingResults,
}) {
  return (
    <section className="workspace-card" aria-labelledby="poll-detail-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{poll.is_published ? 'Published' : 'Draft'}</p>
          <h2 id="poll-detail-title">{poll.title}</h2>
        </div>
        <button type="button" className="text-button" onClick={onBack}>
          Back
        </button>
      </div>

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

      <div className="detail-grid">
        <p>
          <span>Status</span>
          {poll.is_published ? 'Published' : 'Draft'}
        </p>
        <p>
          <span>Created</span>
          {formatDate(poll.created_at)}
        </p>
        <p>
          <span>Updated</span>
          {formatDate(poll.updated_at)}
        </p>
      </div>

      <div className="publish-panel">
        {poll.is_published ? (
          <>
            <div>
              <span>Share Link</span>
              <p>{shareUrl}</p>
            </div>
            {copyMessage && <p className="form-message success">{copyMessage}</p>}
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={onCopyLink}>
                Copy Link
              </button>
              <a className="button-link" href={shareUrl} target="_blank" rel="noreferrer">
                Open Public Poll
              </a>
              <button
                type="button"
                className="danger-button"
                onClick={onUnpublish}
                disabled={isPublishing}
              >
                {isPublishing ? 'Updating...' : 'Unpublish'}
              </button>
            </div>
          </>
        ) : (
          <div className="form-actions">
            <button
              type="button"
              className="primary-button"
              onClick={onPublish}
              disabled={isPublishing}
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        )}
      </div>

      <div className="results-panel" aria-labelledby="results-title">
        <div className="results-header">
          <div>
            <span>Owner Results</span>
            <h3 id="results-title">Total Votes: {results?.totalVotes ?? 0}</h3>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={onRefreshResults}
            disabled={isLoadingResults}
          >
            {isLoadingResults ? 'Refreshing...' : 'Refresh Results'}
          </button>
        </div>

        {resultsError && <p className="form-message error">{resultsError}</p>}

        {!resultsError && !results && isLoadingResults && (
          <p className="placeholder-message">Loading results...</p>
        )}

        {!resultsError && results?.totalVotes === 0 && (
          <p className="placeholder-message">No votes have been submitted yet.</p>
        )}

        {!resultsError && results && (
          <div className="result-list">
            {results.options.map((option) => (
              <div className="result-row" key={option.id}>
                <div className="result-row-header">
                  <span>{option.optionText}</span>
                  <strong>
                    {option.voteCount} {option.voteCount === 1 ? 'vote' : 'votes'} - {option.percentage}%
                  </strong>
                </div>
                <div className="result-bar" aria-hidden="true">
                  <div
                    className="result-bar-fill"
                    style={{ width: `${option.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onEdit}>
          Edit
        </button>
        <button
          type="button"
          className="danger-button"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </section>
  )
}

export default PollDetail
