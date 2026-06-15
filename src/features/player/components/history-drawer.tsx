import { History } from "lucide-react";
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
import { useAudioStore } from "@/stores/use-audio-store";

export function HistoryDrawer() {
	const workflow = useAudioStore((state) => state.workflow);
	const engineState = useAudioStore((state) => state.engineState);
	const rollback = useAudioStore((state) => state.rollback);

	const [drawerOpen, setDrawerOpen] = React.useState(false);

	if (!workflow || !engineState) return null;

	return (
		<Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
			<DrawerTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="h-8 text-xs font-medium gap-1.5 cursor-pointer"
				>
					<History className="size-3.5" />
					History ({engineState.history.length})
				</Button>
			</DrawerTrigger>
			<DrawerContent className="p-4 flex flex-col max-h-[85vh]">
				<DrawerHeader className="text-left px-0 pt-2 pb-4">
					<DrawerTitle className="text-lg font-bold flex items-center gap-2">
						<History className="size-5 text-primary" />
						Playback History
					</DrawerTitle>
					<DrawerDescription>
						View the path of nodes you have visited. Click any previous node to
						roll back playback to that state.
					</DrawerDescription>
				</DrawerHeader>

				<div className="flex-1 overflow-y-auto space-y-0.5 pr-1 relative pl-6 scrollbar-thin py-2">
					<div className="absolute left-3 top-4 bottom-4 w-0.5 bg-muted-foreground/20" />

					{engineState.history
						.map((nodeId, idx) => ({
							key: `${nodeId}-step-${idx}`,
							nodeId,
							idx,
						}))
						.map(({ key, nodeId, idx }) => {
							const isCurrent = idx === engineState.history.length - 1;
							const node = workflow.nodes[nodeId];
							const audioFileName = node
								? node.audioPath.split("/").pop() || node.audioPath
								: "Unknown track";

							return (
								<div
									key={key}
									className="relative flex items-start pb-6 last:pb-2"
								>
									<div
										className={`absolute -left-[19px] top-1.5 size-2 rounded-full border-2 ${
											isCurrent
												? "bg-primary border-primary animate-pulse shadow-xs"
												: "bg-background border-muted-foreground/40 hover:border-primary"
										}`}
									/>

									<button
										type="button"
										disabled={isCurrent}
										onClick={() => {
											rollback(idx);
											setDrawerOpen(false);
										}}
										className={`w-full text-left p-3 rounded-xl border flex flex-col gap-1 transition-all ${
											isCurrent
												? "bg-primary/5 border-primary/20 ring-1 ring-primary/10 select-none cursor-default"
												: "bg-card border-border hover:bg-muted/50 cursor-pointer"
										}`}
									>
										<div className="flex items-center justify-between gap-4">
											<div className="flex items-center gap-2">
												<span className="text-xs text-muted-foreground font-mono">
													#{idx + 1}
												</span>
												<span className="font-semibold text-sm truncate">
													{nodeId}
												</span>
												{isCurrent && (
													<Badge
														variant="secondary"
														className="text-[10px] bg-primary/10 text-primary border-primary/20 shrink-0 font-medium py-0 px-1.5 h-4"
													>
														Current
													</Badge>
												)}
											</div>
											{!isCurrent && (
												<span className="text-[10px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
													Rollback →
												</span>
											)}
										</div>
										<span className="text-xs text-muted-foreground truncate font-mono">
											{audioFileName}
										</span>
									</button>
								</div>
							);
						})}
				</div>

				<DrawerFooter className="px-0 pt-4 pb-2">
					<DrawerClose asChild>
						<Button variant="ghost" className="w-full">
							Close
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
