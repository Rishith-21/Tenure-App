import {useCallback, useEffect, useRef, useState} from 'react';
import Sound from 'react-native-nitro-sound';
import {
  requestMicrophonePermission,
  showPermissionDenied,
} from '../utils/chatPermissions';

/** Ensure local file paths play on Android. */
const normalizePlaybackUri = (uri: string) => {
  if (
    uri.startsWith('file://') ||
    uri.startsWith('http://') ||
    uri.startsWith('https://') ||
    uri.startsWith('content://')
  ) {
    return uri;
  }
  return `file://${uri}`;
};

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordMs, setRecordMs] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const isRecordingRef = useRef(false);
  const recordPathRef = useRef<string | null>(null);
  const recordMsRef = useRef(0);
  const playingIdRef = useRef<string | null>(null);

  useEffect(() => {
    playingIdRef.current = playingId;
  }, [playingId]);

  useEffect(() => {
    Sound.setSubscriptionDuration(0.2);

    return () => {
      Sound.removeRecordBackListener();
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
      Sound.stopRecorder().catch(() => undefined);
      Sound.stopPlayer().catch(() => undefined);
    };
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    const allowed = await requestMicrophonePermission();
    if (!allowed) {
      showPermissionDenied('voice messages');
      return false;
    }

    try {
      await Sound.stopPlayer().catch(() => undefined);
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
      setPlayingId(null);

      const path = await Sound.startRecorder();
      recordPathRef.current = path;
      isRecordingRef.current = true;
      setIsRecording(true);
      setRecordMs(0);
      recordMsRef.current = 0;

      Sound.addRecordBackListener(e => {
        const ms = Math.floor(e.currentPosition);
        recordMsRef.current = ms;
        setRecordMs(ms);
      });

      return true;
    } catch {
      isRecordingRef.current = false;
      setIsRecording(false);
      return false;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!isRecordingRef.current) {
      return null;
    }

    try {
      const path = await Sound.stopRecorder();
      Sound.removeRecordBackListener();
      isRecordingRef.current = false;
      setIsRecording(false);

      const uri = path || recordPathRef.current;
      const durationSec = Math.max(1, Math.round(recordMsRef.current / 1000));
      recordPathRef.current = null;
      recordMsRef.current = 0;
      setRecordMs(0);

      if (!uri) {
        return null;
      }

      return {uri, durationSec};
    } catch {
      isRecordingRef.current = false;
      setIsRecording(false);
      setRecordMs(0);
      return null;
    }
  }, []);

  const playVoice = useCallback(async (messageId: string, uri: string) => {
    try {
      if (playingIdRef.current === messageId) {
        await Sound.stopPlayer();
        Sound.removePlayBackListener();
        Sound.removePlaybackEndListener();
        setPlayingId(null);
        return;
      }

      if (playingIdRef.current) {
        await Sound.stopPlayer();
        Sound.removePlayBackListener();
        Sound.removePlaybackEndListener();
      }

      const playbackUri = normalizePlaybackUri(uri);

      Sound.addPlaybackEndListener(() => {
        Sound.removePlayBackListener();
        Sound.removePlaybackEndListener();
        setPlayingId(null);
      });

      Sound.addPlayBackListener(() => {
        // Progress updates optional; end listener handles completion.
      });

      await Sound.startPlayer(playbackUri);
      setPlayingId(messageId);
    } catch {
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
      setPlayingId(null);
    }
  }, []);

  return {
    isRecording,
    recordMs,
    playingId,
    startRecording,
    stopRecording,
    playVoice,
  };
};
