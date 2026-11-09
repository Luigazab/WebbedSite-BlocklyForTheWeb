import { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Trophy } from "lucide-react";
import { DotLottie } from "@lottiefiles/dotlottie-web";
import wasmUrl from "@lottiefiles/dotlottie-web/dotlottie-player.wasm?url";

DotLottie.setWasmUrl(wasmUrl);

export default function RewardAnimation({ src, light = false }) {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [player, setPlayer] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    if (!player) return;
    const fail = () => setFailed(true);
    player.addEventListener("loadError", fail);
    return () => player.removeEventListener("loadError", fail);
  }, [player]);
  if (reduced || failed)
    return light ? (
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-amber-200/60 blur-3xl"
      />
    ) : (
      <Trophy aria-hidden="true" className="h-36 w-36 text-amber-500" />
    );
  return (
    <div aria-hidden="true" className="h-full w-full">
      <DotLottieReact
        src={src}
        autoplay
        loop={light}
        dotLottieRefCallback={setPlayer}
      />
    </div>
  );
}
