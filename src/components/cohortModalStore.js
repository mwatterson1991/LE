import { useEffect, useState } from 'react'

// Tiny store so any CTA anywhere on the page can open the cohort modal without
// threading props through every section. One modal instance is mounted per page.

let state = { open: false, source: null }
const listeners = new Set()

function emit() {
  listeners.forEach(fn => fn(state))
}

export function openCohortModal(source = 'unknown') {
  state = { open: true, source }
  emit()
}

export function closeCohortModal() {
  state = { open: false, source: state.source }
  emit()
}

export function useCohortModal() {
  const [snapshot, setSnapshot] = useState(state)
  useEffect(() => {
    listeners.add(setSnapshot)
    setSnapshot(state)
    return () => { listeners.delete(setSnapshot) }
  }, [])
  return snapshot
}
