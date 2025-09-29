// DashPlayer.jsx
import { useEffect, useRef } from 'react';
import * as dashjs from 'dashjs';

const DashPlayer = ({ src, autoplay = true }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && src) {
        console.log(dashjs)
      const player = dashjs && dashjs.MediaPlayer().create();
      player.initialize(videoRef.current, src, autoplay);

      return () => {
        player.reset(); // cleanup
      };
    }
  }, [src, autoplay]);

  return (
    <video
      ref={videoRef}
      controls
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default DashPlayer;
