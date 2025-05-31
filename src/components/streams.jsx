import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  CallControls,
  CallParticipantsGrid,
  User,
} from "@stream-io/video-react-sdk";
import { useEffect, useMemo } from "react";

// Replace with your actual values
const apiKey = process.env.REACT_APP_stream_api;
const userId = "user-id"; // Should be unique per user
const token = "authentication-token"; // Generate per user on your backend

const user = { id: userId };

const client = new StreamVideoClient({ apiKey, user, token });
const call = client.call("default", "my-player-meeting");

export const PlayerMeeting = () => {
  useEffect(() => {
    call.join({ create: true });
    return () => call.leave();
  }, []);

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        {/* Video grid for up to 10 users */}
        <CallParticipantsGrid maxParticipants={10} />
        {/* Controls with screen share enabled */}
        <CallControls screenShare />
      </StreamCall>
    </StreamVideo>
  );
};