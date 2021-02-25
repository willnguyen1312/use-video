import React, { useRef, useState, useEffect } from "react";

import { useVideo } from "./useVideo";

import "./App.css";

const videoId = "videoId";

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOneElement, setVideoOneElement] = useState<HTMLVideoElement>();
  const [videoTwoElement, setVideoTwoElement] = useState<HTMLVideoElement>();

  const { state: stateOne, controls: controlsOne } = useVideo(videoOneElement);
  const { state: stateTwo, controls: controlsTwo } = useVideo(videoTwoElement);

  useEffect(() => {
    const videoOne = videoRef.current;
    if (videoOne) {
      setVideoOneElement(videoOne);
    }

    const videoTwo = document.getElementById(videoId) as HTMLVideoElement;

    if (videoTwo) {
      setVideoTwoElement(videoTwo);
    }
  }, []);

  return (
    <>
      <div className="App">
        <video
          width="50%"
          ref={videoRef}
          src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
          controls
        />
        <video
          width="50%"
          id={videoId}
          src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
          controls
        />
      </div>

      <div>
        <button onClick={() => controlsOne.play()}>Play video one</button>
        <h3>Video one current time: {stateOne.currentTime}</h3>
      </div>
      <div>
        <button onClick={() => controlsTwo.play()}>Play video two</button>
        <h3>Video two current time: {stateTwo.currentTime}</h3>
      </div>
    </>
  );
}

export default App;
