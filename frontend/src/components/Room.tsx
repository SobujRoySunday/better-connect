import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const URL = "wss://better-connect-signalling-api.glitch.me"

export const Room = ({ localAudioTrack, localVideoTrack }: {
  localAudioTrack: MediaStreamTrack | null,
  localVideoTrack: MediaStreamTrack | null,
}) => {
  const [lobby, setLobby] = useState(true);
  const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
  const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState<null | MediaStream>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = io(URL);

    socket.on('send-offer', async ({ roomId }) => {
      setLobby(false);
      const pc = new RTCPeerConnection();
      setSendingPc(pc);
      console.log(sendingPc)
      if (localVideoTrack) {
        pc.addTrack(localVideoTrack);
      }
      if (localAudioTrack) {
        pc.addTrack(localAudioTrack);
      }

      pc.onconnectionstatechange = (e) => {
        const rtc = e.srcElement as RTCPeerConnection
        if (rtc.connectionState === 'disconnected') {
          handle()
        }
      }

      pc.onicecandidate = async (e) => {
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "sender",
            roomId
          })
        }
      }

      pc.onnegotiationneeded = async () => {
        const sdp = await pc.createOffer();
        pc.setLocalDescription(sdp)
        socket.emit("offer", {
          sdp,
          roomId
        });
      }
    })

    socket.on('offer', async ({ roomId, sdp: remoteSdp }) => {
      setLobby(false);
      const pc = new RTCPeerConnection();
      pc.setRemoteDescription(remoteSdp);
      const sdp = await pc.createAnswer();
      pc.setLocalDescription(sdp)
      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setRemoteMediaStream(stream);

      setReceivingPc(pc);
      console.log(receivingPc);
      pc.onicecandidate = async (e) => {
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
            roomId
          })
        }
      }

      socket.emit("answer", {
        roomId,
        sdp
      });

      setTimeout(() => {
        const track1 = pc.getTransceivers()[0].receiver.track;
        const track2 = pc.getTransceivers()[1].receiver.track;

        //@ts-ignore
        remoteVideoRef.current.srcObject.addTrack(track1);
        //@ts-ignore
        remoteVideoRef.current.srcObject.addTrack(track2);
        //@ts-ignore
        remoteVideoRef.current.play();
      }, 2000)
    })

    socket.on('answer', ({ sdp: remoteSdp }) => {
      setLobby(false);
      setSendingPc(pc => {
        pc?.setRemoteDescription(remoteSdp)
        return pc;
      })
    })

    socket.on("lobby", () => {
      setLobby(true);
    })

    socket.on("add-ice-candidate", ({ candidate, type }) => {
      if (type == 'sender') {
        setReceivingPc(pc => {
          pc?.addIceCandidate(candidate)
          return pc;
        })
      } else {
        setSendingPc(pc => {
          pc?.addIceCandidate(candidate)
          return pc;
        })
      }
    })
  }, [name])

  useEffect(() => {
    if (localVideoRef.current) {
      if (localVideoTrack) {
        localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
      }
      localVideoRef.current.play();
    }
  }, [localVideoRef, localVideoTrack])

  function handle() {
    window.location.reload()
  }

  return (
    <div className="w-screen h-screen bg-slate-200 flex flex-row justify-center items-center">
      <div className="w-[30%] h-full bg-gray-900">
        <div className="w-full h-[45%] flex justify-center items-center">
          <video className="border-2 w-[90%]" autoPlay width={400} height={400} ref={localVideoRef} />
        </div>
        <div className="w-full h-[45%] flex justify-center items-center">
          <video className="border-2 w-[90%] bg-gray-950" autoPlay width={400} height={400} ref={remoteVideoRef} />
        </div>
        <div className="flex flex-row bg-gray-900 h-[10%] text-white">
          <button onClick={handle} className="w-full h-full flex justify-center items-center bg-gray-800 hover:bg-gray-900 transition-colors">STOP</button>
        </div>
      </div>
      <div className="w-[70%] h-full bg-gray-950 text-white">
        {lobby ? "Waiting to connect you to someone" : null}
      </div>
    </div>
  )
}