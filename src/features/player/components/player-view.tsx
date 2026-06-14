import { Compass, FolderClosed, Play, PlayCircle, Shuffle } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useAudioStore } from "@/stores/use-audio-store";
import { AudioPlayer } from "./audio-player";
import { ChoiceButtons } from "./choice-buttons";
import { PlayerControls } from "./player-controls";

export function PlayerView() {
	const workflow = useAudioStore((state) => state.workflow);
	const engineState = useAudioStore((state) => state.engineState);
	const startEngine = useAudioStore((state) => state.startEngine);
	const jumpToNode = useAudioStore((state) => state.jumpToNode);
	const setActiveTab = useAudioStore((state) => state.setActiveTab);

	const [drawerOpen, setDrawerOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");

	const filteredNodes = React.useMemo(() => {
		if (!workflow) return [];
		return Object.entries(workflow.nodes).filter(([nodeId]) =>
			nodeId.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [workflow, searchQuery]);

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
					{/* Active Status Display / History Breadcrumbs & Jump Select */}
					<div className="flex flex-col gap-2 select-none">
						<div className="flex items-center justify-between gap-4">
							<div className="flex flex-col gap-1">
								<span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
									Playback Status: {engineState.status}
								</span>
							</div>
							<div className="flex items-center gap-2 shrink-0">
								<Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
									<DrawerTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="h-8 text-xs font-medium gap-1.5 cursor-pointer"
										>
											<Shuffle className="size-3.5" />
											Jump Node
										</Button>
									</DrawerTrigger>
									<DrawerContent className="p-4 flex flex-col max-h-[85vh]">
										<DrawerHeader className="text-left px-0 pt-2 pb-4">
											<DrawerTitle className="text-lg font-bold flex items-center gap-2">
												<Compass className="size-5 text-primary" />
												Jump to Any Node
											</DrawerTitle>
											<DrawerDescription>
												Select any node from the workflow configuration to
												immediately start playback from that point.
											</DrawerDescription>
										</DrawerHeader>

										<div className="mb-4">
											<Input
												placeholder="Search nodes..."
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												className="h-9 text-xs"
											/>
										</div>

										<div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
											{filteredNodes.map(([nodeId, node]) => {
												const isCurrent = nodeId === engineState.currentNodeId;
												const audioFileName =
													node.audioPath.split("/").pop() || node.audioPath;
												const transitionCount = node.transitions.length;

												return (
													<button
														type="button"
														key={nodeId}
														onClick={() => {
															jumpToNode(nodeId);
															setDrawerOpen(false);
														}}
														className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-4 transition-all hover:bg-muted/50 cursor-pointer ${
															isCurrent
																? "bg-primary/5 border-primary/30"
																: "bg-card border-border"
														}`}
													>
														<div className="flex flex-col gap-1 min-w-0 flex-1">
															<div className="flex items-center gap-2">
																<span className="font-semibold text-sm truncate">
																	{nodeId}
																</span>
																{isCurrent && (
																	<Badge
																		variant="secondary"
																		className="text-[10px] bg-primary/10 text-primary border-primary/20 shrink-0 font-medium py-0 px-1.5 h-4"
																	>
																		Now Playing
																	</Badge>
																)}
															</div>
															<span className="text-xs text-muted-foreground truncate font-mono">
																{audioFileName}
															</span>
														</div>
														<div className="flex items-center gap-3 shrink-0">
															<span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full border border-border">
																{transitionCount === 0
																	? "End"
																	: `${transitionCount} branch${transitionCount > 1 ? "es" : ""}`}
															</span>
															<Play
																className={`size-4 ${isCurrent ? "text-primary fill-primary" : "text-muted-foreground"}`}
															/>
														</div>
													</button>
												);
											})}
											{filteredNodes.length === 0 && (
												<div className="text-center py-8 text-xs text-muted-foreground">
													No nodes matching "{searchQuery}"
												</div>
											)}
										</div>
										<DrawerFooter className="px-0 pt-4 pb-2">
											<DrawerClose asChild>
												<Button variant="ghost" className="w-full">
													Cancel
												</Button>
											</DrawerClose>
										</DrawerFooter>
									</DrawerContent>
								</Drawer>
							</div>
						</div>

						<div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs font-mono text-muted-foreground/80">
							{engineState.history.map((nodeId, idx) => (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: history timeline order is fixed
									key={`${nodeId}-${idx}`}
									className="flex items-center gap-1.5 shrink-0"
								>
									{idx > 0 && (
										<span className="text-muted-foreground/40">→</span>
									)}
									<span
										className={`px-2 py-0.5 rounded border ${
											idx === engineState.history.length - 1
												? "bg-primary/10 text-primary border-primary/20 font-bold"
												: "bg-muted border-muted-foreground/10"
										}`}
									>
										{nodeId}
									</span>
								</span>
							))}
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
