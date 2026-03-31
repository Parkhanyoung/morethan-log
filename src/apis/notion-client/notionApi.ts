import { NotionAPI } from "notion-client"

const api = new NotionAPI()

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504])
const DEFAULT_RETRY_COUNT = 3
const BASE_DELAY_MS = 400

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const getStatusCode = (error: any) => {
  return error?.statusCode || error?.response?.statusCode
}

const isRetryableError = (error: any) => {
  const statusCode = getStatusCode(error)
  return statusCode ? RETRYABLE_STATUS_CODES.has(statusCode) : false
}

async function withRetry<T>(
  request: () => Promise<T>,
  retries = DEFAULT_RETRY_COUNT
) {
  let lastError: unknown

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await request()
    } catch (error) {
      lastError = error

      if (!isRetryableError(error) || attempt === retries - 1) {
        throw error
      }

      await sleep(BASE_DELAY_MS * (attempt + 1))
    }
  }

  throw lastError
}

export const getNotionPage = (pageId: string) => {
  return withRetry(() => api.getPage(pageId))
}

export const getNotionUsers = (userId: unknown) => {
  return withRetry(() => api.getUsers(userId as any))
}
