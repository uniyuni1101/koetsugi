import { Compass, FolderClosed, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAudioStore } from "@/stores/use-audio-store";
import { AudioPlayer } from "./audio-player";
import { ChoiceButtons } from "./choice-buttons";
import { HistoryDrawer } from "./history-drawer";
import { JumpNodeDrawer } from "./jump-node-drawer";
import { PlayerControls } from "./player-controls";

export function PlayerView() {
	const workflow = useAudioStore((state) => state.workflow);
	const engineState = useAudioStore((state) => state.engineState);
	const startEngine = useAudioStore((state) => state.startEngine);
	const setActiveTab = useAudioStore((state) => state.setActiveTab);

	if (!workflow) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-6 text-center max-w-sm mx-auto gap-4">
				<div className="p-4 bg-muted rounded-full">
					<FolderClosed className="size-10 text-muted-foreground" />
				</div>
				<h2 className="text-xl font-bold">No Directory Loaded</h2>
				<p className="text-sm text-muted-foreground">
					To start listening to your interactive audio work, please load the
					workspace folder containing the configuration and audio tracks first.
				</p>
				<Button
					onClick={() => setActiveTab("settings")}
					className="mt-2 w-full"
				>
					Go to Settings
				</Button>
			</div>
		);
	}

	const handleStart = () => {
		startEngine();
	};

	const showStartPrompt = !engineState || engineState.status === "idle";

	return (
		<div className="flex flex-col h-full w-full max-w-lg mx-auto p-4 overflow-hidden gap-4 pb-20 justify-between">
			<AudioPlayer />

			{showStartPrompt ? (
				<Card className="my-auto">
					<CardHeader className="text-center">
						<CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
							<Compass className="size-6 text-primary animate-pulse" />
							Interactive Audio Branch
						</CardTitle>
						<CardDescription>
							Press Start to enter the interactive playback narrative.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col items-center">
						<Button
							onClick={handleStart}
							className="w-full py-6 text-base flex gap-2"
						>
							<PlayCircle className="size-5" />
							Start Playback
						</Button>
					</CardContent>
				</Card>
			) : (
				<>
					{/* Active Status Display & Controls (Jump / History Drawers) */}
					<div className="flex flex-col gap-2 select-none">
						<div className="flex items-center justify-between gap-4">
							<div className="flex flex-col gap-1">
								<span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
									Playback Status: {engineState.status}
								</span>
							</div>
							<div className="flex items-center gap-2 shrink-0">
								<HistoryDrawer />
								<JumpNodeDrawer />
							</div>
						</div>
					</div>

					{/* Center Interaction: Split Choice screen or standard Playing view */}
					{engineState.choices.length > 0 ? (
						<ChoiceButtons />
					) : (
						<div className="flex-1 flex flex-col justify-center items-center gap-4 border-2 border-dashed border-muted rounded-2xl p-6 bg-muted/10 my-4 min-h-0">
							<div className="relative flex items-center justify-center size-28 rounded-full bg-primary/5 border border-primary/10">
								{engineState.status === "playing" ? (
									<>
										<span className="absolute animate-ping size-16 rounded-full bg-primary/20" />
										<span className="absolute animate-pulse size-20 rounded-full bg-primary/10" />
										<Compass className="size-10 text-primary animate-spin [animation-duration:10s]" />
									</>
								) : (
									<Compass className="size-10 text-muted-foreground" />
								)}
							</div>
							<div className="text-center max-w-xs flex flex-col gap-1">
								<h3 className="font-bold text-lg truncate">
									{engineState.currentNodeId}
								</h3>
								<p className="text-xs text-muted-foreground font-mono truncate px-4">
									{engineState.currentAudioPath}
								</p>
								{engineState.status === "completed" && (
									<span className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2">
										Reached End of Workflow
									</span>
								)}
							</div>
						</div>
					)}

					{/* Playback Progress Timeline bar */}
					{engineState.status !== "waitingForChoice" && <PlayerControls />}
				</>
			)}
		</div>
	);
}
