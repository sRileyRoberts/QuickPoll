import { supabase } from './supabaseClient'

function normalizePollInput(values) {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    question: values.question.trim(),
    options: values.options.map((option) => option.trim()).filter(Boolean),
  }
}

export async function getUserPolls(userId) {
  const { data, error } = await supabase
    .from('polls')
    .select('id, title, question, is_published, created_at, updated_at')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function getPollWithOptions(pollId, userId) {
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('id, owner_id, title, description, question, is_published, created_at, updated_at')
    .eq('id', pollId)
    .eq('owner_id', userId)
    .single()

  if (pollError) {
    throw pollError
  }

  const { data: options, error: optionsError } = await supabase
    .from('poll_options')
    .select('id, option_text, display_order')
    .eq('poll_id', pollId)
    .order('display_order', { ascending: true })

  if (optionsError) {
    throw optionsError
  }

  return {
    ...poll,
    options,
  }
}

export async function createPoll(userId, values) {
  const pollValues = normalizePollInput(values)

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({
      owner_id: userId,
      title: pollValues.title,
      description: pollValues.description,
      question: pollValues.question,
      is_published: false,
    })
    .select('id')
    .single()

  if (pollError) {
    throw pollError
  }

  const optionRows = pollValues.options.map((optionText, index) => ({
    poll_id: poll.id,
    option_text: optionText,
    display_order: index + 1,
  }))

  const { error: optionsError } = await supabase
    .from('poll_options')
    .insert(optionRows)

  if (optionsError) {
    await supabase.from('polls').delete().eq('id', poll.id).eq('owner_id', userId)
    throw optionsError
  }

  return poll.id
}

export async function updatePoll(pollId, userId, values, { updateOptions = true } = {}) {
  const pollValues = normalizePollInput(values)

  const { error: pollError } = await supabase
    .from('polls')
    .update({
      title: pollValues.title,
      description: pollValues.description,
      question: pollValues.question,
    })
    .eq('id', pollId)
    .eq('owner_id', userId)

  if (pollError) {
    throw pollError
  }

  if (!updateOptions) {
    return
  }

  const { error: deleteOptionsError } = await supabase
    .from('poll_options')
    .delete()
    .eq('poll_id', pollId)

  if (deleteOptionsError) {
    throw deleteOptionsError
  }

  const optionRows = pollValues.options.map((optionText, index) => ({
    poll_id: pollId,
    option_text: optionText,
    display_order: index + 1,
  }))

  const { error: insertOptionsError } = await supabase
    .from('poll_options')
    .insert(optionRows)

  if (insertOptionsError) {
    throw insertOptionsError
  }
}

export async function deletePoll(pollId, userId) {
  const { error } = await supabase
    .from('polls')
    .delete()
    .eq('id', pollId)
    .eq('owner_id', userId)

  if (error) {
    throw error
  }
}

export async function publishPoll(pollId, userId) {
  const { error } = await supabase
    .from('polls')
    .update({ is_published: true })
    .eq('id', pollId)
    .eq('owner_id', userId)

  if (error) {
    throw error
  }
}

export async function unpublishPoll(pollId, userId) {
  const { error } = await supabase
    .from('polls')
    .update({ is_published: false })
    .eq('id', pollId)
    .eq('owner_id', userId)

  if (error) {
    throw error
  }
}

export async function fetchPublicPoll(pollId) {
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('id, title, description, question, is_published, created_at')
    .eq('id', pollId)
    .eq('is_published', true)
    .maybeSingle()

  if (pollError) {
    throw pollError
  }

  if (!poll) {
    return null
  }

  const { data: options, error: optionsError } = await supabase
    .from('poll_options')
    .select('id, option_text, display_order')
    .eq('poll_id', pollId)
    .order('display_order', { ascending: true })

  if (optionsError) {
    throw optionsError
  }

  return {
    ...poll,
    options,
  }
}

export async function submitVote(pollId, optionId) {
  const { error } = await supabase
    .from('votes')
    .insert({
      poll_id: pollId,
      option_id: optionId,
    })

  if (error) {
    throw error
  }
}

export async function fetchPollResults(pollId, userId) {
  const poll = await getPollWithOptions(pollId, userId)

  const { data: votes, error: votesError } = await supabase
    .from('votes')
    .select('option_id')
    .eq('poll_id', pollId)

  if (votesError) {
    throw votesError
  }

  const totalVotes = votes.length
  const voteCounts = votes.reduce((counts, vote) => {
    counts[vote.option_id] = (counts[vote.option_id] || 0) + 1
    return counts
  }, {})

  return {
    totalVotes,
    options: poll.options.map((option) => {
      const voteCount = voteCounts[option.id] || 0
      const percentage =
        totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100)

      return {
        id: option.id,
        optionText: option.option_text,
        displayOrder: option.display_order,
        voteCount,
        percentage,
      }
    }),
  }
}
