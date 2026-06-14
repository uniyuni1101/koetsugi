import { ArrowRight, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkflowNode } from "@/workflows/types";

interface NodeCardProps {
	node: WorkflowNode;
	isInitial: boolean;
	onEdit: () => void;
}

export function NodeCard({ node, isInitial, onEdit }: NodeCardProps) {
	// Format badge color depending on transition type
	const getTransitionBadge = () => {
		if (node.transitions.length === 0) {
			return <Badge variant="destructive">End Node (No exits)</Badge>;
		}

		const type = node.transitions[0].type;
		switch (type) {
			case "choice":
				return (
					<Badge variant="default">Choice ({node.transitions.length})</Badge>
				);
			case "random":
				return (
					<Badge variant="secondary">Random ({node.transitions.length})</Badge>
				);
			case "direct":
				return <Badge variant="outline">Direct Connection</Badge>;
			default:
				return null;
		}
	};

	return (
		<Card className="relative hover:shadow-md transition-shadow">
			<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
				<CardTitle className="font-mono text-base font-bold flex gap-2 items-center truncate max-w-[70%]">
					{node.id}
					{isInitial && (
						<Badge className="bg-emerald-600 hover:bg-emerald-600/95 font-sans font-normal text-[10px] py-0 px-1.5 leading-4">
							Start
						</Badge>
					)}
				</CardTitle>
				<Button variant="ghost" size="icon" onClick={onEdit} className="size-8">
					<Edit2 className="size-3.5" />
				</Button>
			</CardHeader>
			<CardContent className="flex flex-col gap-2.5">
				<div className="text-xs text-muted-foreground font-mono truncate bg-muted/50 p-1.5 rounded border">
					{node.audioPath}
				</div>

				<div className="flex flex-col gap-1.5 mt-1">
					<div className="flex justify-between items-center text-xs">
						<span className="text-muted-foreground font-medium">
							Outbound Transitions:
						</span>
						{getTransitionBadge()}
					</div>

					{node.transitions.length > 0 && (
						<div className="flex flex-col gap-1 max-h-24 overflow-y-auto border-l border-muted pl-2 text-xs font-mono text-muted-foreground">
							{node.transitions.map((t) => {
								const targetText =
									t.type === "choice"
										? `"${t.buttonText}" → ${t.targetId}`
										: t.type === "random"
											? `Weight: ${t.weight} → ${t.targetId}`
											: `→ ${t.targetId}`;

								const key =
									t.type === "choice"
										? `choice-${t.targetId}-${t.buttonText}`
										: t.type === "random"
											? `random-${t.targetId}-${t.weight}`
											: `direct-${t.targetId}`;

								return (
									<div
										key={key}
										className="flex items-center gap-1 py-0.5 truncate"
									>
										<ArrowRight className="size-3 text-muted-foreground/50 shrink-0" />
										<span className="truncate">{targetText}</span>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
