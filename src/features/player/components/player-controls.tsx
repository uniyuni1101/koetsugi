import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioStore } from "@/stores/use-audio-store";

export function PlayerControls() {
	const engineState = useAudioStore((state) => state.engineState);
	const audioCurrentTime = useAudioStore((state) => state.audioCurrentTime);
	const audioDuration = useAudioStore((state) => state.audioDuration);
	const playEngine = useAudioStore((state) => state.playEngine);
	const pauseEngine = useAudioStore((state) => state.pauseEngine);
	const resetEngine = useAudioStore((state) => state.resetEngine);

	if (!engineState) return null;

	const formatTime = (secs: number) => {
		if (Number.isNaN(secs) || !Number.isFinite(secs)) return "00:00";
		const m = Math.floor(secs / 60);
		const s = Math.floor(secs % 60);
		return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	};

	const isPlaying = engineState.status === "playing";
	const progressPercent =
		audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0;

	return (
		<div className="flex flex-col gap-3 p-4 bg-muted/40 rounded-xl border">
			<div className="flex justify-between items-center text-xs text-muted-foreground font-mono">
				<span>{formatTime(audioCurrentTime)}</span>
				<span className="font-semibold text-foreground/80 truncate px-2">
					Node: {engineState.currentNodeId}
				</span>
				<span>{formatTime(audioDuration)}</span>
			</div>

			{/* Progress Bar */}
			<div className="w-full h-2 bg-secondary rounded-full overflow-hidden relative">
				<div
					className="h-full bg-primary transition-all duration-150 ease-out"
					style={{ width: `${progressPercent}%` }}
				/>
			</div>

			<div className="flex justify-center items-center gap-4 mt-1">
				<Button
					variant="outline"
					size="icon"
					onClick={resetEngine}
					className="rounded-full size-10"
					title="Restart current node"
				>
					<RotateCcw className="size-4" />
				</Button>
				{isPlaying ? (
					<Button
						onClick={pauseEngine}
						size="icon"
						className="rounded-full size-12 bg-primary text-primary-foreground hover:bg-primary/95 shadow-md"
					>
						<Pause className="size-5" />
					</Button>
				) : (
					<Button
						onClick={playEngine}
						size="icon"
						disabled={
							engineState.status === "completed" ||
							engineState.status === "waitingForChoice"
						}
						className="rounded-full size-12 bg-primary text-primary-foreground hover:bg-primary/95 shadow-md"
					>
						<Play className="size-5" />
					</Button>
				)}
				<div className="size-10" /> {/* Spacer to balance layout */}
			</div>
		</div>
	);
}
