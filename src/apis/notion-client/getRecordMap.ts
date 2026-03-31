import { getNotionPage } from "./notionApi"
import { normalizeRecordMap } from "src/libs/utils/notion/normalizeRecordMap"

export const getRecordMap = async (pageId: string) => {
  const recordMap = normalizeRecordMap(await getNotionPage(pageId) as any)
  return recordMap
}
