import { create } from "zustand";
import { WorkflowEngine } from "@/workflows/engine";
import type { EngineState, Workflow, WorkflowNode } from "@/workflows/types";
import { validateWorkflow } from "@/workflows/validation";

interface AudioStoreState {
	directoryHandle: FileSystemDirectoryHandle | null;
	filesMap: Record<string, File>;
	workflow: Workflow | null;
	engine: WorkflowEngine | null;
	engineState: EngineState | null;
	audioCurrentTime: number;
	audioDuration: number;
	seekRequestTime: number | null;
	activeTab: "player" | "editor" | "settings";

	// Actions
	setActiveTab: (tab: "player" | "editor" | "settings") => void;
	setDirectory: (
		handle: FileSystemDirectoryHandle | null,
		files: Record<string, File>,
	) => void;
	loadWorkflow: (workflowJson: unknown) => {
		success: boolean;
		errors?: string[];
	};
	updateWorkflowNode: (nodeId: string, updatedNode: WorkflowNode) => void;
	saveWorkflow: () => Promise<{
		success: boolean;
		dataString?: string;
		error?: string;
	}>;

	// Engine control wrapper actions
	startEngine: (startNodeId?: string) => void;
	playEngine: () => void;
	pauseEngine: () => void;
	audioEnded: () => void;
	selectChoice: (targetId: string) => void;
	jumpToNode: (targetId: string) => void;
	back: () => void;
	setAudioProgress: (currentTime: number, duration: number) => void;
	requestSeek: (time: number | null) => void;
	resetEngine: () => void;
}

export const useAudioStore = create<AudioStoreState>((set, get) => {
	let unsubscribeEngine: (() => void) | null = null;

	const cleanupEngine = () => {
		if (unsubscribeEngine) {
			unsubscribeEngine();
			unsubscribeEngine = null;
		}
		const existingEngine = get().engine;
		if (existingEngine) {
			existingEngine.stop();
		}
	};

	return {
		directoryHandle: null,
		filesMap: {},
		workflow: null,
		engine: null,
		engineState: null,
		audioCurrentTime: 0,
		audioDuration: 0,
		seekRequestTime: null,
		activeTab: "settings",

		setActiveTab: (tab) => set({ activeTab: tab }),

		setDirectory: (handle, files) => {
			cleanupEngine();
			set({
				directoryHandle: handle,
				filesMap: files,
				workflow: null,
				engine: null,
				engineState: null,
				audioCurrentTime: 0,
				audioDuration: 0,
				seekRequestTime: null,
			});
		},

		loadWorkflow: (workflowJson) => {
			cleanupEngine();

			const validationResult = validateWorkflow(workflowJson);
			if (!validationResult.isValid || !validationResult.workflow) {
				return {
					success: false,
					errors: validationResult.errors.map((e) => `${e.path}: ${e.message}`),
				};
			}

			const workflow = validationResult.workflow;
			const engine = new WorkflowEngine(workflow);

			// Subscribe to engine changes and push to Zustand
			const sub = engine.subscribe((state) => {
				set({ engineState: state });
			});
			unsubscribeEngine = sub.unsubscribe;

			set({
				workflow,
				engine,
				engineState: engine.state,
				audioCurrentTime: 0,
				audioDuration: 0,
				seekRequestTime: null,
			});

			return { success: true };
		},

		updateWorkflowNode: (nodeId, updatedNode) => {
			const { workflow } = get();
			if (!workflow) return;

			const updatedNodes = {
				...workflow.nodes,
				[nodeId]: updatedNode,
			};

			const newWorkflow: Workflow = {
				...workflow,
				nodes: updatedNodes,
			};

			// Re-initialize engine with updated workflow
			cleanupEngine();
			const engine = new WorkflowEngine(newWorkflow);
			const sub = engine.subscribe((state) => {
				set({ engineState: state });
			});
			unsubscribeEngine = sub.unsubscribe;

			set({
				workflow: newWorkflow,
				engine,
				engineState: engine.state,
			});
		},

		saveWorkflow: async () => {
			const { workflow, directoryHandle } = get();
			if (!workflow) {
				return { success: false, error: "No workflow loaded to save." };
			}

			const workflowString = JSON.stringify(workflow, null, 2);

			if (directoryHandle) {
				try {
					// Verify/request write permission
					const fileHandle = await directoryHandle.getFileHandle(
						"workflow.json",
						{
							create: true,
						},
					);
					const writable = await fileHandle.createWritable();
					await writable.write(workflowString);
					await writable.close();
					return { success: true };
				} catch (err: unknown) {
					console.error(
						"Directory writable failed, using download fallback",
						err,
					);
					return {
						success: true,
						dataString: workflowString,
						error:
							"Failed writing to directory. Saving via browser download fallback.",
					};
				}
			}

			// Fallback if no directory handle (e.g. mobile Safari uploaded in memory)
			return {
				success: true,
				dataString: workflowString,
			};
		},

		startEngine: (startNodeId) => {
			const { engine } = get();
			if (engine) {
				engine.start(startNodeId);
				set({ engineState: engine.state });
			}
		},

		playEngine: () => {
			const { engine } = get();
			if (engine) {
				engine.play();
				set({ engineState: engine.state });
			}
		},

		pauseEngine: () => {
			const { engine } = get();
			if (engine) {
				engine.pause();
				set({ engineState: engine.state });
			}
		},

		audioEnded: () => {
			const { engine } = get();
			if (engine) {
				engine.audioEnded();
				set({ engineState: engine.state });
			}
		},

		selectChoice: (targetId) => {
			const { engine } = get();
			if (engine) {
				engine.selectChoice(targetId);
				set({ engineState: engine.state });
			}
		},

		jumpToNode: (targetId) => {
			const { engine } = get();
			if (engine) {
				engine.jumpToNode(targetId);
				set({ engineState: engine.state });
			}
		},

		back: () => {
			const { engine } = get();
			if (engine) {
				engine.back();
				set({ engineState: engine.state });
			}
		},

		setAudioProgress: (currentTime, duration) => {
			set({
				audioCurrentTime: currentTime,
				audioDuration: duration,
			});
		},

		requestSeek: (time) => {
			set({ seekRequestTime: time });
		},

		resetEngine: () => {
			cleanupEngine();
			const { workflow } = get();
			if (workflow) {
				const engine = new WorkflowEngine(workflow);
				const sub = engine.subscribe((state) => {
					set({ engineState: state });
				});
				unsubscribeEngine = sub.unsubscribe;
				set({
					engine,
					engineState: engine.state,
					audioCurrentTime: 0,
					audioDuration: 0,
					seekRequestTime: null,
				});
			}
		},
	};
});
