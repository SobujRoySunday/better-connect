import { useEffect, useRef, useState } from "react"
import { Room } from "./Room";

export const Landing = () => {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState<null | MediaStreamTrack>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<null | MediaStreamTrack>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getCam = async () => {
    const stream = window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    const audioTrack = (await stream).getAudioTracks()[0];
    const videoTrack = (await stream).getVideoTracks()[0];
    setLocalAudioTrack(audioTrack);
    setLocalVideoTrack(videoTrack);
    if (!videoRef.current) {
      return;
    }
    videoRef.current.srcObject = new MediaStream([videoTrack])
    videoRef.current.play()
  }
  useEffect(() => {
    if (videoRef && videoRef.current) {
      getCam()
    }
  }, []);

  if (!joined) {
    return (
      <div>
        <video ref={videoRef} autoPlay />
        <input type="text" value={name} onChange={(e) => {
          setName(e.target.value);
        }} />
        <button onClick={() => { setJoined(true) }}>Join</button>
      </div >
    )
  } else {
    return (<Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} />)
  }
}