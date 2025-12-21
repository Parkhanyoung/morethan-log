import { useEffect, useRef } from "react"

export function useRestoreScroll(router: any) {
  // 스크롤 복원 여부 확인을 위해 사용되는 flag 값
  const shouldScrollRestore = useRef(false)

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      shouldScrollRestore.current = false
      window.history.scrollRestoration = "manual"

      const onRouteChangeStart = () => {
        if (!shouldScrollRestore.current) {
          ;(function saveScrollPos() {
            sessionStorage.setItem("scrollPos", String(window.scrollY))
          })()
        }
      }

      const onRouteChangeComplete = () => {
        if (shouldScrollRestore.current) {
          shouldScrollRestore.current = false
          ;(function restoreScrollPos() {
            const scrollPos = sessionStorage.getItem("scrollPos")
            if (scrollPos) {
              window.scrollTo(0, Number(scrollPos))
              sessionStorage.removeItem("scrollPos")
            }
          })()
        }
      }

      router.events.on("routeChangeStart", onRouteChangeStart)
      router.events.on("routeChangeComplete", onRouteChangeComplete)
      router.beforePopState(() => {
        shouldScrollRestore.current = true
        return true
      })

      return () => {
        router.events.off("routeChangeStart", onRouteChangeStart)
        router.events.off("routeChangeComplete", onRouteChangeComplete)
        router.beforePopState(() => true)
      }
    }
  }, [router])
}
