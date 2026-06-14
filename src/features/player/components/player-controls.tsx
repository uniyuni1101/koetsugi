import {
	FastForward,
	Pause,
	Play,
	Rewind,
	RotateCcw,
	SkipBack,
	SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioStore } from "@/stores/use-audio-store";

export function PlayerControls() {
	const workflow = useAudioStore((state) => state.workflow);
	const engineState = useAudioStore((state) => state.engineState);
	const audioCurrentTime = useAudioStore((state) => state.audioCurrentTime);
	const audioDuration = useAudioStore((state) => state.audioDuration);
	const playEngine = useAudioStore((state) => state.playEngine);
	const pauseEngine = useAudioStore((state) => state.pauseEngine);
	const back = useAudioStore((state) => state.back);
	const audioEnded = useAudioStore((state) => state.audioEnded);
	const requestSeek = useAudioStore((state) => state.requestSeek);
	const resetEngine = useAudioStore((state) => state.resetEngine);

	if (!engineState) return null;

	const formatTime = (secs: number) => {
		if (Number.isNaN(secs) || !Number.isFinite(secs)) return "00:00";
		const m = Math.floor(secs / 60);
		const s = Math.floor(secs % 60);
		return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	};

	const isPlaying = engineState.status === "playing";

	// Rewind / Forward 10s handlers
	const handleRewind10 = () => {
		requestSeek(Math.max(0, audioCurrentTime - 10));
	};

	const handleForward10 = () => {
		requestSeek(Math.min(audioDuration, audioCurrentTime + 10));
	};

	// Next / Previous Node handlers
	const canGoPrev = engineState.history.length > 1;
	const handlePrevNode = () => {
		if (!canGoPrev) return;
		back();
	};

	const currentNode =
		engineState.currentNodeId && workflow
			? workflow.nodes[engineState.currentNodeId]
			: null;
	const canGoNext = currentNode && currentNode.transitions.length > 0;
	const handleNextNode = () => {
		if (!currentNode || !canGoNext) return;
		audioEnded();
	};

	const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const targetTime = parseFloat(e.target.value);
		requestSeek(targetTime);
	};

	return (
		<div className="flex flex-col gap-3 p-4 bg-muted/40 rounded-xl border select-none">
			<div className="flex justify-between items-center text-xs text-muted-foreground font-mono">
				<span>{formatTime(audioCurrentTime)}</span>
				<span className="font-semibold text-foreground/80 truncate px-2">
					Node: {engineState.currentNodeId}
				</span>
				<span>{formatTime(audioDuration)}</span>
			</div>

			{/* Seekable Timeline Slider Input */}
			<div className="w-full relative px-0.5">
				<input
					type="range"
					min="0"
					max={audioDuration || 100}
					step={0.001}
					value={audioCurrentTime}
					onChange={handleSliderChange}
					className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary focus:outline-none"
				/>
			</div>

			<div className="flex justify-between items-center gap-2 mt-1 px-2">
				{/* Back to previous node */}
				<Button
					variant="ghost"
					size="icon"
					disabled={!canGoPrev}
					onClick={handlePrevNode}
					className="rounded-full size-10"
					title="Previous node"
				>
					<SkipBack className="size-4" />
				</Button>

				{/* 10s Rewind */}
				<Button
					variant="ghost"
					size="icon"
					onClick={handleRewind10}
					className="rounded-full size-10"
					title="Rewind 10 seconds"
				>
					<Rewind className="size-4" />
				</Button>

				{/* Play / Pause */}
				{isPlaying ? (
					<Button
						onClick={pauseEngine}
						size="icon"
						className="rounded-full size-12 bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shrink-0"
						title="Pause"
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
						className="rounded-full size-12 bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shrink-0"
						title="Play"
					>
						<Play className="size-5" />
					</Button>
				)}

				{/* 10s Forward */}
				<Button
					variant="ghost"
					size="icon"
					onClick={handleForward10}
					className="rounded-full size-10"
					title="Forward 10 seconds"
				>
					<FastForward className="size-4" />
				</Button>

				{/* Skip to next node */}
				<Button
					variant="ghost"
					size="icon"
					disabled={!canGoNext}
					onClick={handleNextNode}
					className="rounded-full size-10"
					title="Skip to next node"
				>
					<SkipForward className="size-4" />
				</Button>
			</div>

			<div className="flex justify-center mt-1">
				<Button
					variant="link"
					size="sm"
					onClick={resetEngine}
					className="text-xs text-muted-foreground flex gap-1 items-center h-8"
				>
					<RotateCcw className="size-3" />
					Restart Node
				</Button>
			</div>
		</div>
	);
}
