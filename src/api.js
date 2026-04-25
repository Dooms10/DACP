export const callApi = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-role': 'admin',
      ...(options.headers || {}),
    },
  })

  const rawText = await response.text()
  let data = {}
  if (rawText) {
    try {
      data = JSON.parse(rawText)
    } catch {
      data = { message: rawText }
    }
  }

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.')
  }
  return data
}
