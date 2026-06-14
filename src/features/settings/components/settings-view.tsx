import { FileAudio, Music, RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAudioStore } from "@/stores/use-audio-store";
import { FolderLoader } from "./folder-loader";

export function SettingsView() {
	const filesMap = useAudioStore((state) => state.filesMap);
	const workflow = useAudioStore((state) => state.workflow);
	const resetEngine = useAudioStore((state) => state.resetEngine);
	const setActiveTab = useAudioStore((state) => state.setActiveTab);

	const audioFiles = Object.keys(filesMap).filter((path) =>
		/\.(mp3|wav|ogg|m4a|aac)$/i.test(path),
	);

	return (
		<div className="flex flex-col gap-6 p-4 max-w-lg mx-auto w-full overflow-y-auto h-full pb-20">
			<div className="flex items-center gap-2 mb-2">
				<Settings className="size-6 text-primary" />
				<h1 className="text-2xl font-bold tracking-tight">
					Settings & Workspace
				</h1>
			</div>

			<FolderLoader />

			{workflow && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Music className="size-5 text-primary" />
							Active Workflow Details
						</CardTitle>
						<CardDescription>
							Parsed metadata of the active branch script
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						<div className="grid grid-cols-2 gap-2 text-sm">
							<span className="text-muted-foreground">Workflow ID:</span>
							<span className="font-mono font-medium truncate">
								{workflow.workflowId}
							</span>

							<span className="text-muted-foreground">Initial Node:</span>
							<span className="font-mono font-medium truncate">
								{workflow.initialNodeId}
							</span>

							<span className="text-muted-foreground">Total Nodes:</span>
							<span className="font-medium">
								{Object.keys(workflow.nodes).length}
							</span>
						</div>

						<Separator />

						<div className="flex flex-col gap-2">
							<Button
								onClick={resetEngine}
								variant="outline"
								className="w-full flex gap-2"
							>
								<RefreshCw className="size-4" />
								Reset Playback Engine
							</Button>
							<Button onClick={() => setActiveTab("player")} className="w-full">
								Go to Player
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{audioFiles.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<FileAudio className="size-4 text-primary" />
							Detected Audio Files ({audioFiles.length})
						</CardTitle>
					</CardHeader>
					<CardContent className="max-h-60 overflow-y-auto">
						<ul className="text-xs font-mono divide-y">
							{audioFiles.map((path) => (
								<li key={path} className="py-2 text-muted-foreground truncate">
									{path}
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
