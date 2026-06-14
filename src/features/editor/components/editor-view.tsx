import { FolderClosed, Plus, Save, Search } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useAudioStore } from "@/stores/use-audio-store";
import type { WorkflowNode } from "@/workflows/types";
import { NodeCard } from "./node-card";
import { NodeEditorForm } from "./node-editor-form";

export function EditorView() {
	const workflow = useAudioStore((state) => state.workflow);
	const updateWorkflowNode = useAudioStore((state) => state.updateWorkflowNode);
	const saveWorkflow = useAudioStore((state) => state.saveWorkflow);
	const setActiveTab = useAudioStore((state) => state.setActiveTab);

	const [searchQuery, setSearchQuery] = React.useState("");
	const [editingNode, setEditingNode] = React.useState<WorkflowNode | null>(
		null,
	);
	const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
	const [isNewNode, setIsNewNode] = React.useState(false);

	if (!workflow) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-6 text-center max-w-sm mx-auto gap-4">
				<div className="p-4 bg-muted rounded-full">
					<FolderClosed className="size-10 text-muted-foreground" />
				</div>
				<h2 className="text-xl font-bold">No Directory Loaded</h2>
				<p className="text-sm text-muted-foreground">
					To start editing your branching audio nodes, please load your
					workspace folder from Settings first.
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

	const nodes = Object.values(workflow.nodes);
	const filteredNodes = nodes.filter(
		(node) =>
			node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			node.audioPath.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleEditNode = (node: WorkflowNode) => {
		setIsNewNode(false);
		setEditingNode(node);
		setIsDrawerOpen(true);
	};

	const handleCreateNode = () => {
		setIsNewNode(true);
		setEditingNode(null);
		setIsDrawerOpen(true);
	};

	const handleSaveNode = (updatedNode: WorkflowNode) => {
		updateWorkflowNode(updatedNode.id, updatedNode);
		setIsDrawerOpen(false);
		setEditingNode(null);
		toast.success(`Node "${updatedNode.id}" saved to workflow context!`);
	};

	const handleSaveWorkflow = async () => {
		const result = await saveWorkflow();
		if (result.success) {
			if (result.dataString) {
				// Falling back to browser file download (e.g. mobile Safari)
				try {
					const blob = new Blob([result.dataString], {
						type: "application/json",
					});
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = "workflow.json";
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
					URL.revokeObjectURL(url);
					toast.success("Workflow downloaded successfully!");
				} catch (err: unknown) {
					const error = err as Error;
					toast.error(`Download failed: ${error.message}`);
				}
			} else {
				toast.success("workflow.json saved successfully to directory!");
			}
		} else {
			toast.error(`Failed to save workflow: ${result.error}`);
		}
	};

	return (
		<div className="flex flex-col h-full w-full max-w-lg mx-auto p-4 overflow-hidden gap-4 pb-20 justify-between">
			<div className="flex items-center justify-between shrink-0">
				<h1 className="text-xl font-bold tracking-tight">Workflow Nodes</h1>
				<div className="flex gap-2">
					<Button
						onClick={handleSaveWorkflow}
						size="sm"
						className="flex gap-1.5 items-center"
					>
						<Save className="size-4" /> Save
					</Button>
				</div>
			</div>

			{/* Search */}
			<div className="relative shrink-0">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
				<Input
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Search nodes or paths..."
					className="pl-9 w-full"
				/>
			</div>

			{/* Nodes List */}
			<div className="flex-1 overflow-y-auto pr-1">
				{filteredNodes.length > 0 ? (
					<div className="flex flex-col gap-3 py-1">
						{filteredNodes.map((node) => (
							<NodeCard
								key={node.id}
								node={node}
								isInitial={node.id === workflow.initialNodeId}
								onEdit={() => handleEditNode(node)}
							/>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl mt-4 text-center text-muted-foreground">
						<p className="text-sm font-medium">No nodes match search query</p>
					</div>
				)}
			</div>

			{/* Floating Action Button (FAB) to Add Node */}
			<Button
				onClick={handleCreateNode}
				className="absolute bottom-20 right-4 size-14 rounded-full shadow-lg p-0 bg-primary hover:bg-primary/95 flex items-center justify-center text-primary-foreground z-10"
				title="Add Node"
			>
				<Plus className="size-6" />
			</Button>

			{/* Node Editor Drawer */}
			<Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
				<DrawerContent className="max-h-[85vh]">
					<DrawerHeader className="text-left pb-1 shrink-0">
						<DrawerTitle>
							{isNewNode
								? "Add New Workflow Node"
								: `Edit Node: ${editingNode?.id}`}
						</DrawerTitle>
						<DrawerDescription>
							Define the relative audio track path and exit transitions for this
							node.
						</DrawerDescription>
					</DrawerHeader>
					<NodeEditorForm
						node={editingNode}
						onSave={handleSaveNode}
						onCancel={() => setIsDrawerOpen(false)}
					/>
				</DrawerContent>
			</Drawer>
		</div>
	);
}
