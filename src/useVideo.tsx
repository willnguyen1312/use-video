import { useCallback, useState, useEffect } from "react";

const useSetState = <T extends object>(
  initialState: T = {} as T
): [T, (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void] => {
  const [state, set] = useState<T>(initialState);
  const setState = useCallback(
    (patch) => {
      set((prevState) =>
        Object.assign(
          {},
          prevState,
          patch instanceof Function ? patch(prevState) : patch
        )
      );
    },
    [set]
  );

  return [state, setState];
};

export interface HTMLMediaState {
  buffered: TimeRanges | null;
  duration: number;
  paused: boolean;
  muted: boolean;
  currentTime: number;
  volume: number;
}

export const useVideo = (idOrEle?: string | HTMLMediaElement) => {
  const [state, setState] = useSetState<HTMLMediaState>({
    buffered: null,
    currentTime: 0,
    duration: 0,
    paused: true,
    muted: false,
    volume: 1,
  });

  let mediaElement: HTMLMediaElement | undefined;

  const wrapEvent = (userEvent, proxyEvent?) => {
    return (event) => {
      try {
        proxyEvent && proxyEvent(event);
      } finally {
        userEvent && userEvent(event);
      }
    };
  };

  const onPlay = () => setState({ paused: false });
  const onPause = () => setState({ paused: true });
  const onVolumeChange = () => {
    if (!mediaElement) {
      return;
    }
    setState({
      muted: mediaElement.muted,
      volume: mediaElement.volume,
    });
  };
  const onDurationChange = () => {
    if (!mediaElement) {
      return;
    }
    const { duration, buffered } = mediaElement;
    setState({
      duration,
      buffered,
    });
  };
  const onTimeUpdate = () => {
    if (!mediaElement) {
      return;
    }
    setState({ currentTime: mediaElement.currentTime });
  };
  const onProgress = () => {
    if (!mediaElement) {
      return;
    }
    setState({ buffered: mediaElement.buffered });
  };

  if (typeof idOrEle === "string") {
    mediaElement = document.getElementById(idOrEle) as HTMLMediaElement;

    if (!(mediaElement instanceof HTMLMediaElement)) {
      throw new Error("Please pass in id of media element");
    }
  }

  if (idOrEle instanceof HTMLMediaElement) {
    mediaElement = idOrEle;
  }

  // Some browsers return `Promise` on `.play()` and may throw errors
  // if one tries to execute another `.play()` or `.pause()` while that
  // promise is resolving. So we prevent that with this lock.
  // See: https://bugs.chromium.org/p/chromium/issues/detail?id=593273
  let lockPlay: boolean = false;

  const controls = {
    play: () => {
      if (!mediaElement) {
        return undefined;
      }

      if (!lockPlay) {
        const promise = mediaElement.play();
        const isPromise = typeof promise === "object";

        if (isPromise) {
          lockPlay = true;
          const resetLock = () => {
            lockPlay = false;
          };
          promise.then(resetLock, resetLock);
        }

        return promise;
      }
      return undefined;
    },
    pause: () => {
      if (mediaElement && !lockPlay) {
        return mediaElement.pause();
      }
    },
    seek: (time: number) => {
      if (!mediaElement || !state.duration) {
        return;
      }
      time = Math.min(state.duration, Math.max(0, time));
      mediaElement.currentTime = time;
    },
    volume: (volume: number) => {
      if (!mediaElement) {
        return;
      }
      volume = Math.min(1, Math.max(0, volume));
      mediaElement.volume = volume;
      setState({ volume });
    },
    mute: () => {
      if (!mediaElement) {
        return;
      }
      mediaElement.muted = true;
    },
    unmute: () => {
      if (!mediaElement) {
        return;
      }
      mediaElement.muted = false;
    },
  };

  useEffect(() => {
    if (!mediaElement) {
      return;
    }

    mediaElement.addEventListener("play", onPlay);
    mediaElement.addEventListener("pause", onPause);
    mediaElement.addEventListener("volumechange", onVolumeChange);
    mediaElement.addEventListener("durationchange", onDurationChange);
    mediaElement.addEventListener("timeupdate", onTimeUpdate);
    mediaElement.addEventListener("progress", onProgress);

    setState({
      volume: mediaElement.volume,
      muted: mediaElement.muted,
      paused: mediaElement.paused,
    });
  }, [mediaElement, idOrEle]);

  return {
    state,
    controls,
  };
};
