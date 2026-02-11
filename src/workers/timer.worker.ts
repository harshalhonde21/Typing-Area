/* eslint-disable no-restricted-globals */

// Define the messages that can be sent to/from the worker
type TimerMessage =
  | { type: 'START'; duration: number }
  | { type: 'STOP' }
  | { type: 'RESET' };

type WorkerMessage =
  | { type: 'TICK'; timeLeft: number; elapsed: number }
  | { type: 'DONE' };

let timerId: ReturnType<typeof setInterval> | null = null;
let startTime: number | null = null;
let duration = 60;

self.onmessage = (e: MessageEvent<TimerMessage>) => {
  const { type } = e.data;

  switch (type) {
    case 'START':
      if (timerId) clearInterval(timerId);
      if ('duration' in e.data) {
        duration = e.data.duration;
      }
      startTime = Date.now();

      timerId = setInterval(() => {
        if (!startTime) return;
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const timeLeft = Math.max(0, duration - elapsed);

        self.postMessage({ type: 'TICK', timeLeft, elapsed } as WorkerMessage);

        if (timeLeft === 0) {
          if (timerId) clearInterval(timerId);
          self.postMessage({ type: 'DONE' } as WorkerMessage);
        }
      }, 100);
      break;

    case 'STOP':
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      break;

    case 'RESET':
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      startTime = null;
      break;
  }
};
