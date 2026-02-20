type QueuedAction = { type: string; payload: any };

let queue: QueuedAction[] = [];

export function enqueue(action: QueuedAction) {
  queue.push(action);
  // Persist to sessionStorage so queue survives minor hiccups (not full refresh)
  try {
    sessionStorage.setItem("kb_queue", JSON.stringify(queue));
  } catch {}
}

export function flushQueue(send: (action: QueuedAction) => void) {
  const toFlush = [...queue];
  queue = [];
  try { sessionStorage.removeItem("kb_queue"); } catch {}
  toFlush.forEach(send);
}

export function getQueueLength(): number {
  return queue.length;
}

export function loadPersistedQueue() {
  try {
    const raw = sessionStorage.getItem("kb_queue");
    if (raw) queue = JSON.parse(raw);
  } catch {}
}