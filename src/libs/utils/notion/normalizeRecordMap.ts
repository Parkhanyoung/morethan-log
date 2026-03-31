type RecordValueEntry<T = unknown> = {
  value?: T | { value?: T }
}

type RecordMapLike = {
  block?: Record<string, RecordValueEntry>
  collection?: Record<string, RecordValueEntry>
  collection_view?: Record<string, RecordValueEntry>
  notion_user?: Record<string, RecordValueEntry>
  space?: Record<string, RecordValueEntry>
  [key: string]: unknown
}

export const unwrapRecordValue = <T>(entry?: RecordValueEntry<T>) => {
  const value = entry?.value
  if (value && typeof value === "object" && "value" in value) {
    return value.value as T | undefined
  }

  return value as T | undefined
}

const normalizeRecordValueMap = <T>(map?: Record<string, RecordValueEntry<T>>) => {
  if (!map) return map

  return Object.fromEntries(
    Object.entries(map).map(([key, entry]) => [
      key,
      {
        ...entry,
        value: unwrapRecordValue(entry),
      },
    ])
  )
}

export const normalizeRecordMap = <T extends RecordMapLike>(recordMap: T) => {
  const block = normalizeRecordValueMap(recordMap.block)
  const collection = normalizeRecordValueMap(recordMap.collection)
  const collectionView = normalizeRecordValueMap(recordMap.collection_view)
  const notionUser = normalizeRecordValueMap(recordMap.notion_user)
  const space = normalizeRecordValueMap(recordMap.space)

  return {
    ...recordMap,
    ...(block ? { block } : {}),
    ...(collection ? { collection } : {}),
    ...(collectionView ? { collection_view: collectionView } : {}),
    ...(notionUser ? { notion_user: notionUser } : {}),
    ...(space ? { space } : {}),
  }
}
