import { Compass, Play, Shuffle } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function JumpNodeDrawer() {
	const workflow = useAudioStore((state) => state.workflow);
	const engineState = useAudioStore((state) => state.engineState);
	const jumpToNode = useAudioStore((state) => state.jumpToNode);

	const [drawerOpen, setDrawerOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");

	const filteredNodes = React.useMemo(() => {
		if (!workflow) return [];
		return Object.entries(workflow.nodes).filter(([nodeId]) =>
			nodeId.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [workflow, searchQuery]);

	if (!workflow || !engineState) return null;

	return (
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
						Select any node from the workflow configuration to immediately start
						playback from that point.
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
	);
}
