import { Compass } from "lucide-react";
import type { PlaybackState } from "@/workflows/types";

interface PlaybackStatusCardProps {
	status: PlaybackState;
	currentNodeId: string | null;
	currentAudioPath: string | null;
}

export function PlaybackStatusCard({
	status,
	currentNodeId,
	currentAudioPath,
}: PlaybackStatusCardProps) {
	return (
		<div className="flex-1 flex flex-col justify-center items-center gap-4 border-2 border-dashed border-muted rounded-2xl p-6 bg-muted/10 my-4 min-h-0 w-full">
			<div className="relative flex items-center justify-center size-28 rounded-full bg-primary/5 border border-primary/10">
				{status === "playing" ? (
					<>
						<span className="absolute animate-ping size-16 rounded-full bg-primary/20" />
						<span className="absolute animate-pulse size-20 rounded-full bg-primary/10" />
						<Compass className="size-10 text-primary animate-spin [animation-duration:10s]" />
					</>
				) : (
					<Compass className="size-10 text-muted-foreground" />
				)}
			</div>
			<div className="text-center max-w-xs flex flex-col gap-1 w-full overflow-hidden">
				<h3 className="font-bold text-lg truncate">
					{currentNodeId || "No Active Node"}
				</h3>
				<p className="text-xs text-muted-foreground font-mono truncate px-4">
					{currentAudioPath || "No audio loaded"}
				</p>
				{status === "completed" && (
					<span className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2">
						Reached End of Workflow
					</span>
				)}
			</div>
		</div>
	);
}
