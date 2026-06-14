import * as React from "react";
import { useAudioStore } from "@/stores/use-audio-store";

export function AudioPlayer() {
	const filesMap = useAudioStore((state) => state.filesMap);
	const engineState = useAudioStore((state) => state.engineState);
	const audioEnded = useAudioStore((state) => state.audioEnded);
	const setAudioProgress = useAudioStore((state) => state.setAudioProgress);
	const seekRequestTime = useAudioStore((state) => state.seekRequestTime);
	const requestSeek = useAudioStore((state) => state.requestSeek);

	const audioRef = React.useRef<HTMLAudioElement | null>(null);
	const [objectUrl, setObjectUrl] = React.useState<string | null>(null);

	// Load audio file when currentAudioPath changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: engineState is stable and objectUrl is handled in closure
	React.useEffect(() => {
		if (!engineState || !engineState.currentAudioPath) {
			setObjectUrl(null);
			return;
		}

		const audioFile = filesMap[engineState.currentAudioPath];
		if (!audioFile) {
			console.error(`Audio file not found: ${engineState.currentAudioPath}`);
			return;
		}

		const url = URL.createObjectURL(audioFile);
		setObjectUrl(url);

		return () => {
			URL.revokeObjectURL(url);
		};
	}, [engineState?.currentAudioPath, filesMap]);

	// Play/Pause control based on engineState status and objectUrl
	React.useEffect(() => {
		const audio = audioRef.current;
		if (!audio || !engineState || !objectUrl) return;

		if (engineState.status === "playing") {
			audio.play().catch((err) => {
				console.error("Playback failed", err);
			});
		} else if (
			engineState.status === "paused" ||
			engineState.status === "idle"
		) {
			audio.pause();
		}
	}, [engineState, objectUrl]);

	// Seek timeline handler
	React.useEffect(() => {
		const audio = audioRef.current;
		if (audio && seekRequestTime !== null) {
			audio.currentTime = seekRequestTime;
			requestSeek(null);
		}
	}, [seekRequestTime, requestSeek]);

	const handleTimeUpdate = () => {
		const audio = audioRef.current;
		if (audio) {
			setAudioProgress(audio.currentTime, audio.duration || 0);
		}
	};

	const handleEnded = () => {
		audioEnded();
	};

	if (!objectUrl) return null;

	return (
		<>
			{/* biome-ignore lint/a11y/useMediaCaption: custom hidden player */}
			<audio
				ref={audioRef}
				src={objectUrl}
				onTimeUpdate={handleTimeUpdate}
				onEnded={handleEnded}
				className="hidden"
			/>
		</>
	);
}
