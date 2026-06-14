import { Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAudioStore } from "@/stores/use-audio-store";
import type { Transition, WorkflowNode } from "@/workflows/types";

interface NodeEditorFormProps {
	node: WorkflowNode | null; // null if creating a new node
	onSave: (node: WorkflowNode) => void;
	onCancel: () => void;
}

export function NodeEditorForm({
	node,
	onSave,
	onCancel,
}: NodeEditorFormProps) {
	const filesMap = useAudioStore((state) => state.filesMap);
	const workflow = useAudioStore((state) => state.workflow);

	const audioFiles = Object.keys(filesMap).filter((path) =>
		/\.(mp3|wav|ogg|m4a|aac)$/i.test(path),
	);

	const allNodeIds = workflow ? Object.keys(workflow.nodes) : [];

	// Local states for form validation
	const [id, setId] = React.useState(node?.id || "");
	const [audioPath, setAudioPath] = React.useState(node?.audioPath || "");
	const [transitionType, setTransitionType] = React.useState<
		"none" | "direct" | "choice" | "random"
	>(
		node?.transitions && node.transitions.length > 0
			? (node.transitions[0].type as "none" | "direct" | "choice" | "random")
			: "none",
	);

	// Holds the raw transition models
	const [transitions, setTransitions] = React.useState<Transition[]>(
		node?.transitions || [],
	);

	// Handle type changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: run only on transitionType change
	React.useEffect(() => {
		if (transitionType === "none") {
			setTransitions([]);
		} else if (transitionType === "direct") {
			setTransitions([{ type: "direct", targetId: allNodeIds[0] || "" }]);
		} else if (
			transitions.length === 0 ||
			transitions[0]?.type !== transitionType
		) {
			// Initialize with single item
			const base = { targetId: allNodeIds[0] || "" };
			if (transitionType === "choice") {
				setTransitions([{ type: "choice", ...base, buttonText: "Option 1" }]);
			} else if (transitionType === "random") {
				setTransitions([{ type: "random", ...base, weight: 1 }]);
			}
		}
	}, [transitionType]);

	const handleAddTransition = () => {
		const base = { targetId: allNodeIds[0] || "" };
		if (transitionType === "choice") {
			setTransitions([
				...transitions,
				{
					type: "choice",
					...base,
					buttonText: `Option ${transitions.length + 1}`,
				} as Transition,
			]);
		} else if (transitionType === "random") {
			setTransitions([
				...transitions,
				{ type: "random", ...base, weight: 1 } as Transition,
			]);
		}
	};

	const handleRemoveTransition = (index: number) => {
		setTransitions(transitions.filter((_, idx) => idx !== index));
	};

	const handleUpdateTransition = (
		index: number,
		fields: Partial<Transition>,
	) => {
		setTransitions(
			transitions.map((t, idx) =>
				idx === index ? ({ ...t, ...fields } as Transition) : t,
			),
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!id.trim()) {
			toast.error("Node ID is required.");
			return;
		}

		if (!audioPath) {
			toast.error("Please select an audio path.");
			return;
		}

		if (transitionType !== "none" && transitions.length === 0) {
			toast.error("Please add at least one transition target.");
			return;
		}

		// Validation of weight/targets
		for (const t of transitions) {
			if (!t.targetId) {
				toast.error("All transitions must have a target node selected.");
				return;
			}
			if (t.type === "choice" && !t.buttonText.trim()) {
				toast.error("All choice transitions require a button text label.");
				return;
			}
			if (t.type === "random" && (Number.isNaN(t.weight) || t.weight <= 0)) {
				toast.error("Random weights must be positive numbers.");
				return;
			}
		}

		const updatedNode: WorkflowNode = {
			id: id.trim(),
			audioPath,
			transitions,
		};

		onSave(updatedNode);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-5 p-4 text-left max-h-[85vh] overflow-y-auto pb-12"
		>
			<div className="flex flex-col gap-2">
				<Label htmlFor="node-id">Node ID</Label>
				<Input
					id="node-id"
					value={id}
					onChange={(e) => setId(e.target.value)}
					placeholder="e.g. node_start, node_branch_a"
					disabled={node !== null} // Cannot rename existing node ID to preserve workflow refs
					className="font-mono text-sm"
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Label htmlFor="audio-path">Audio File Path</Label>
				<Select value={audioPath} onValueChange={setAudioPath}>
					<SelectTrigger id="audio-path" className="w-full text-left truncate">
						<SelectValue placeholder="Select audio file..." />
					</SelectTrigger>
					<SelectContent position="popper">
						{audioFiles.map((path) => (
							<SelectItem
								key={path}
								value={path}
								className="font-mono text-xs truncate"
							>
								{path}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex flex-col gap-2">
				<Label htmlFor="transition-type">Transition Interface Type</Label>
				<Select
					value={transitionType}
					onValueChange={(val: "none" | "direct" | "choice" | "random") =>
						setTransitionType(val)
					}
				>
					<SelectTrigger id="transition-type" className="w-full">
						<SelectValue placeholder="Select type..." />
					</SelectTrigger>
					<SelectContent position="popper">
						<SelectItem value="none">End Node (No Exits)</SelectItem>
						<SelectItem value="direct">
							Direct Connection (Auto jump)
						</SelectItem>
						<SelectItem value="choice">Choice (User buttons select)</SelectItem>
						<SelectItem value="random">Random (Probability route)</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{transitionType !== "none" && (
				<div className="flex flex-col gap-3 mt-1">
					<div className="flex justify-between items-center">
						<Label className="text-sm font-semibold">Exits / Connections</Label>
						{(transitionType === "choice" || transitionType === "random") && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleAddTransition}
								className="h-8 flex gap-1 items-center"
							>
								<Plus className="size-3.5" /> Add Target
							</Button>
						)}
					</div>

					<Separator />

					<div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
						{transitions.map((t, index) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: order can change but keys are stable within item editing
								key={index}
								className="flex gap-2 items-center bg-muted/30 p-2.5 rounded-lg border"
							>
								<div className="flex-1 flex flex-col gap-2">
									{/* Target Node Selection */}
									<div className="flex items-center gap-2">
										<span className="text-xs text-muted-foreground font-medium w-12 shrink-0">
											Target:
										</span>
										<Select
											value={t.targetId}
											onValueChange={(val) =>
												handleUpdateTransition(index, { targetId: val })
											}
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
									{t.type === "choice" && (
										<div className="flex items-center gap-2">
											<span className="text-xs text-muted-foreground font-medium w-12 shrink-0">
												Label:
											</span>
											<Input
												value={t.buttonText}
												onChange={(e) =>
													handleUpdateTransition(index, {
														buttonText: e.target.value,
													})
												}
												placeholder="Choice Button Text Label"
												className="flex-1 h-8 text-xs"
											/>
										</div>
									)}

									{t.type === "random" && (
										<div className="flex items-center gap-2">
											<span className="text-xs text-muted-foreground font-medium w-12 shrink-0">
												Weight:
											</span>
											<Input
												type="number"
												value={t.weight}
												onChange={(e) =>
													handleUpdateTransition(index, {
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
										onClick={() => handleRemoveTransition(index)}
										className="size-8 text-destructive hover:bg-destructive/10"
									>
										<Trash2 className="size-4" />
									</Button>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			<div className="flex gap-3 mt-4">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					className="flex-1"
				>
					Cancel
				</Button>
				<Button type="submit" className="flex-1">
					Save Node
				</Button>
			</div>
		</form>
	);
}
