import { NotionAPI } from "notion-client"
import { normalizeRecordMap } from "src/libs/utils/notion/normalizeRecordMap"

export const getRecordMap = async (pageId: string) => {
  const api = new NotionAPI()
  const recordMap = normalizeRecordMap(await api.getPage(pageId) as any)
  return recordMap
}
