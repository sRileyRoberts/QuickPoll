function formatDate(value) {
  return new Date(value).toLocaleString()
}

function PollDetail({ poll, onBack, onEdit, onDelete, isDeleting }) {
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
