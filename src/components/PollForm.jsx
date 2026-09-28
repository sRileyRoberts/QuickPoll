import { useState } from 'react'

const emptyPoll = {
  title: '',
  description: '',
  question: '',
  options: ['', ''],
}

function toFormValues(poll) {
  if (!poll) {
    return emptyPoll
  }

  return {
    title: poll.title || '',
    description: poll.description || '',
    question: poll.question || '',
    options: poll.options?.map((option) => option.option_text) || ['', ''],
  }
}

function PollForm({
  mode,
  poll,
  lockOptions = false,
  optionLockReason = 'Answer options are locked. You can still edit the title, description, and question.',
  onCancel,
  onSubmit,
}) {
  const [values, setValues] = useState(() => toFormValues(poll))
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const isEditing = mode === 'edit'

  function updateField(field, value) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updateOption(index, value) {
    setValues((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    }))
  }

  function addOption() {
    setValues((current) => ({
      ...current,
      options: current.options.length >= 6 ? current.options : [...current.options, ''],
    }))
  }

  function removeOption(index) {
    setValues((current) => ({
      ...current,
      options:
        current.options.length <= 2
          ? current.options
          : current.options.filter((_option, optionIndex) => optionIndex !== index),
    }))
  }

  function validatePoll() {
    const trimmedOptions = values.options.map((option) => option.trim()).filter(Boolean)

    if (!values.title.trim()) {
      return 'Please enter a poll title.'
    }

    if (!values.question.trim()) {
      return 'Please enter the poll question.'
    }

    if (trimmedOptions.length < 2) {
      return 'Please enter at least two answer options.'
    }

    if (trimmedOptions.length > 6) {
      return 'Polls can have no more than six answer options.'
    }

    if (!lockOptions && values.options.some((option) => !option.trim())) {
      return 'Remove blank options or fill them in before saving.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const validationError = validatePoll()

    if (validationError) {
      setError(validationError)
      return
    }

    setIsSaving(true)

    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
        question: values.question.trim(),
        options: values.options.map((option) => option.trim()),
      })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="workspace-card" aria-labelledby="poll-form-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Draft Poll</p>
          <h2 id="poll-form-title">{isEditing ? 'Edit Poll' : 'Create Poll'}</h2>
        </div>
        <button type="button" className="text-button" onClick={onCancel}>
          Back
        </button>
      </div>

      <form className="poll-form" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            value={values.title}
            onChange={(event) => updateField('title', event.target.value)}
            disabled={isSaving}
            required
          />
        </label>

        <label>
          Description
          <textarea
            value={values.description}
            onChange={(event) => updateField('description', event.target.value)}
            disabled={isSaving}
            rows="3"
          />
        </label>

        <label>
          Question
          <input
            type="text"
            value={values.question}
            onChange={(event) => updateField('question', event.target.value)}
            disabled={isSaving}
            required
          />
        </label>

        <div className="options-editor">
          <div className="options-header">
            <h3>Answer Options</h3>
            <span>{values.options.length}/6</span>
          </div>

          {lockOptions && (
            <p className="form-message error">
              {optionLockReason}
            </p>
          )}

          {values.options.map((option, index) => (
            <div className="option-row" key={`option-${index + 1}`}>
              <label>
                Option {index + 1}
                <input
                  type="text"
                  value={option}
                  onChange={(event) => updateOption(index, event.target.value)}
                  disabled={isSaving || lockOptions}
                  required
                />
              </label>
              <button
                type="button"
                className="icon-button"
                onClick={() => removeOption(index)}
                disabled={isSaving || lockOptions || values.options.length <= 2}
                aria-label={`Remove option ${index + 1}`}
              >
                -
              </button>
            </div>
          ))}

          <button
            type="button"
            className="secondary-button"
            onClick={addOption}
            disabled={isSaving || lockOptions || values.options.length >= 6}
          >
            Add Option
          </button>
        </div>

        {error && <p className="form-message error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={isSaving}>
            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Poll'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default PollForm
