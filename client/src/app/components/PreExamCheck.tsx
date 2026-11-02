import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Copy,
  Eye,
  Loader2,
  Maximize,
  MonitorX,
} from "lucide-react";
import { Button } from "./ui/button";

type Props = {
  examTitle: string;
  durationMin: number;
  violationLimit: number;
  /** Called once the camera works and fullscreen has started. Receives the live camera stream. */
  onStart: (stream: MediaStream) => void;
};

type CameraStatus = "idle" | "requesting" | "ready" | "denied" | "error";

export default function PreExamCheck({
  examTitle,
  durationMin,
  violationLimit,
  onStart,
}: Props) {
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handedOff = useRef(false);

  // Show the camera in the preview whenever the stream changes.
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // If the student leaves this screen without starting, turn the camera off.
  // Once the stream is handed to the exam, the exam owns it.
  useEffect(() => {
    return () => {
      if (!handedOff.current) {
        streamRef.current?.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const enableCamera = async () => {
    setStartError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      return;
    }

    setStatus("requesting");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      // If the camera is unplugged or turned off later, go back to "not ready".
      mediaStream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setStatus("error");
          setStream(null);
        };
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setStatus("ready");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setStatus(name === "NotAllowedError" ? "denied" : "error");
    }
  };

  const handleStart = async () => {
    if (!stream || status !== "ready") return;

    setStarting(true);
    setStartError(null);

    // Fullscreen must be requested from a click, so it happens here.
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      setStartError(
        "Could not enter fullscreen. Allow fullscreen for this site and try again."
      );
      setStarting(false);
      return;
    }

    handedOff.current = true;
    onStart(stream);
  };

  const rules = [
    {
      icon: Maximize,
      title: "Stay in fullscreen",
      text: "The exam opens in fullscreen. Leaving it counts as a violation.",
    },
    {
      icon: MonitorX,
      title: "Stay on this tab",
      text: "Switching tabs or windows is recorded with a timestamp.",
    },
    {
      icon: Eye,
      title: "Keep your face in view",
      text: "No face, or more than one face, for a few seconds is a violation.",
    },
    {
      icon: Copy,
      title: "No copy, paste or right-click",
      text: "These are blocked during the exam.",
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] px-8 py-8 lg:px-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">{examTitle}</h1>
        <p className="mt-2 text-muted-foreground">
          {durationMin} minutes. Check your camera and read the rules before you
          start.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Rules */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium text-foreground">Exam rules</h2>
          <ul className="mt-5 space-y-5">
            {rules.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex gap-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              After {violationLimit} violations your exam is submitted
              automatically. Your camera is not recorded, only violations are
              logged.
            </p>
          </div>
        </section>

        {/* Camera check */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium text-foreground">Camera check</h2>

          <div className="mt-5 aspect-video overflow-hidden rounded-lg border border-border bg-background">
            {status === "ready" ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full -scale-x-100 object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                {status === "requesting" ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <Camera className="h-8 w-8 text-muted-foreground" />
                )}
                <p className="text-sm text-muted-foreground">
                  {status === "idle" && "Your camera preview will appear here."}
                  {status === "requesting" && "Waiting for camera permission…"}
                  {status === "denied" &&
                    "Camera access is blocked. Allow the camera for this site in your browser settings, then try again."}
                  {status === "error" &&
                    "No working camera found. Connect a camera, close other apps that use it, then try again."}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm">
            {status === "ready" ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-foreground">Camera is working</span>
              </>
            ) : (
              <span className="text-muted-foreground">Camera not ready</span>
            )}
          </div>

          {startError && (
            <p className="mt-3 text-sm text-red-400">{startError}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {status !== "ready" && (
              <Button
                variant="outline"
                onClick={enableCamera}
                disabled={status === "requesting"}
              >
                {status === "denied" || status === "error"
                  ? "Try again"
                  : "Enable camera"}
              </Button>
            )}
            <Button
              onClick={handleStart}
              disabled={status !== "ready" || starting}
            >
              {starting ? "Starting…" : "Start exam"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
