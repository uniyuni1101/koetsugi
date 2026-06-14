import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Transition } from "@/workflows/types";

interface TransitionItemEditorProps {
	transition: Transition;
	index: number;
	allNodeIds: string[];
	transitionType: "direct" | "choice" | "random";
	onUpdate: (index: number, fields: Partial<Transition>) => void;
	onRemove: (index: number) => void;
}

export function TransitionItemEditor({
	transition,
	index,
	allNodeIds,
	transitionType,
	onUpdate,
	onRemove,
}: TransitionItemEditorProps) {
	return (
		<div className="flex gap-2 items-center bg-muted/30 p-2.5 rounded-lg border">
			<div className="flex-1 flex flex-col gap-2">
				{/* Target Node Selection */}
				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground font-medium w-12 shrink-0">
						Target:
					</span>
					<Select
						value={transition.targetId}
						onValueChange={(val) => onUpdate(index, { targetId: val })}
					>
						<SelectTrigger className="flex-1 text-xs font-mono h-8">
							<SelectValue placeholder="Select target node..." />
						</SelectTrigger>
						<SelectContent position="popper">
							{allNodeIds.map((nodeId) => (
								<SelectItem
									key={nodeId}
									value={nodeId}
									className="font-mono text-xs"
								>
									{nodeId}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Custom details depending on transition type */}
				{transition.type === "choice" && (
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground font-medium w-12 shrink-0">
							Label:
						</span>
						<Input
							value={transition.buttonText}
							onChange={(e) => onUpdate(index, { buttonText: e.target.value })}
							placeholder="Choice Button Text Label"
							className="flex-1 h-8 text-xs"
						/>
					</div>
				)}

				{transition.type === "random" && (
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground font-medium w-12 shrink-0">
							Weight:
						</span>
						<Input
							type="number"
							value={transition.weight}
							onChange={(e) =>
								onUpdate(index, {
									weight: parseFloat(e.target.value) || 0,
								})
							}
							placeholder="Relative Probability Weight"
							className="flex-1 h-8 text-xs"
						/>
					</div>
				)}
			</div>

			{/* Delete transition (only if not direct) */}
			{transitionType !== "direct" && (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => onRemove(index)}
					className="size-8 text-destructive hover:bg-destructive/10"
				>
					<Trash2 className="size-4" />
				</Button>
			)}
		</div>
	);
}
