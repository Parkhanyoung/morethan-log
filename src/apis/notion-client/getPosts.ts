import { CONFIG } from "site.config"
import { idToUuid } from "notion-utils"

import getAllPageIds from "src/libs/utils/notion/getAllPageIds"
import getPageProperties from "src/libs/utils/notion/getPageProperties"
import { normalizeRecordMap } from "src/libs/utils/notion/normalizeRecordMap"
import { getNotionPage } from "./notionApi"
import { TPosts } from "src/types"

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */

// TODO: react query를 사용해서 처음 불러온 뒤로는 해당데이터만 사용하도록 수정
const POSTS_CACHE_TTL_MS = 5_000

let cachedPosts:
  | {
      expiresAt: number
      promise: Promise<TPosts>
    }
  | undefined

const fetchPosts = async () => {
  let id = CONFIG.notionConfig.pageId as string

  const response: any = normalizeRecordMap(await getNotionPage(id) as any)
  id = idToUuid(id)
  const collection = (Object.values(response.collection as any)[0] as any)?.value
  const block = response.block as any
  const schema = collection?.schema

  const rawMetadata = block[id].value

  // Check Type
  if (
    rawMetadata?.type !== "collection_view_page" &&
    rawMetadata?.type !== "collection_view"
  ) {
    return []
  } else {
    // Construct Data
    const pageIds = getAllPageIds(response)
    const data = []
    for (let i = 0; i < pageIds.length; i++) {
      const id = pageIds[i]
      const properties = (await getPageProperties(id, block, schema)) || null
      // Add fullwidth, createdtime to properties
      properties.createdTime = new Date(
        block[id].value?.created_time
      ).toString()
      properties.fullWidth =
        (block[id].value?.format as any)?.page_full_width ?? false

      data.push(properties)
    }

    // Sort by date
    data.sort((a: any, b: any) => {
      const dateA: any = new Date(a?.date?.start_date || a.createdTime)
      const dateB: any = new Date(b?.date?.start_date || b.createdTime)
      return dateB - dateA
    })

    const posts = data as TPosts
    return posts
  }
}

export const getPosts = async () => {
  const now = Date.now()
  if (cachedPosts && cachedPosts.expiresAt > now) {
    return cachedPosts.promise
  }

  const promise = fetchPosts().catch((error) => {
    if (cachedPosts?.promise === promise) {
      cachedPosts = undefined
    }
    throw error
  })

  cachedPosts = {
    expiresAt: now + POSTS_CACHE_TTL_MS,
    promise,
  }

  return promise
}
