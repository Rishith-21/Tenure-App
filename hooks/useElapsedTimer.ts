import {useEffect, useState} from 'react';
import {getElapsedSecondsSince} from '../utils/meetTime';

/** Live HH:MM:SS counter from a session start timestamp. */
export function useElapsedTimer(startedAtMs: number | null, running = true) {
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (!startedAtMs || !running) {
      return;
    }
    setElapsedSec(getElapsedSecondsSince(startedAtMs));
    const id = setInterval(() => {
      setElapsedSec(getElapsedSecondsSince(startedAtMs));
    }, 1000);
    return () => clearInterval(id);
  }, [startedAtMs, running]);

  return elapsedSec;
}
