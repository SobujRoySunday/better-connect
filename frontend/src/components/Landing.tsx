import { useEffect, useRef, useState } from "react"
import { Room } from "./Room";

export const Landing = () => {
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
      <div className="w-screen h-screen bg-slate-200 flex justify-center items-center">
        <div className=" flex flex-col shadow-2xl">
          <video className="rounded-t-xl" ref={videoRef} autoPlay />
          <button className="p-5 bg-teal-500 hover:bg-teal-600 transition-colors rounded-b-lg" onClick={() => { setJoined(true) }}>Join</button>
        </div>
      </div>
    )
  } else {
    return (<Room localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} />)
  }
}