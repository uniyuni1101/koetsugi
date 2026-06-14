import { type Actor, createActor } from "xstate";
import { createWorkflowMachine } from "./machine";
import type {
	ChoiceTransition,
	EngineState,
	PlaybackState,
	Workflow,
} from "./types";
import { validateWorkflow } from "./validation";

export class WorkflowEngine {
	private actor: Actor<ReturnType<typeof createWorkflowMachine>>;

	constructor(workflow: Workflow, options?: { validate?: boolean }) {
		if (options?.validate !== false) {
			const result = validateWorkflow(workflow);
			if (!result.isValid) {
				throw new Error(
					`Invalid workflow definition: ${result.errors.map((e) => `${e.path}: ${e.message}`).join(", ")}`,
				);
			}
		}

		const machine = createWorkflowMachine(workflow);
		this.actor = createActor(machine);
	}

	/**
	 * Starts the workflow engine. Optional startNodeId can be passed to resume/start from a specific node.
	 */
	start(startNodeId?: string): void {
		this.actor.start();
		this.actor.send({ type: "START", startNodeId });
	}

	play(): void {
		this.actor.send({ type: "PLAY" });
	}

	pause(): void {
		this.actor.send({ type: "PAUSE" });
	}

	audioEnded(): void {
		this.actor.send({ type: "AUDIO_ENDED" });
	}

	selectChoice(targetId: string): void {
		const currentState = this.state;
		if (currentState.status !== "waitingForChoice") {
			throw new Error(
				`Cannot select choice when engine is in status "${currentState.status}"`,
			);
		}

		const hasChoice = currentState.choices.some((c) => c.targetId === targetId);
		if (!hasChoice) {
			throw new Error(
				`Invalid choice targetId "${targetId}". Available choices: ${currentState.choices.map((c) => c.targetId).join(", ")}`,
			);
		}

		this.actor.send({ type: "SELECT_CHOICE", targetId });
	}

	get state(): EngineState {
		const snapshot = this.actor.getSnapshot();
		const currentNodeId = snapshot.context.currentNodeId;
		const currentNode = currentNodeId
			? snapshot.context.workflow.nodes[currentNodeId]
			: null;

		let status: PlaybackState = "idle";
		if (snapshot.matches("playing")) status = "playing";
		else if (snapshot.matches("paused")) status = "paused";
		else if (snapshot.matches("waitingForChoice")) status = "waitingForChoice";
		else if (snapshot.matches("completed")) status = "completed";

		const choices =
			status === "waitingForChoice" && currentNode
				? (currentNode.transitions.filter(
						(t) => t.type === "choice",
					) as ChoiceTransition[])
				: [];

		return {
			status,
			currentNodeId,
			currentAudioPath: currentNode ? currentNode.audioPath : null,
			choices,
			history: snapshot.context.history,
		};
	}

	subscribe(listener: (state: EngineState) => void): {
		unsubscribe: () => void;
	} {
		const subscription = this.actor.subscribe(() => {
			listener(this.state);
		});
		return {
			unsubscribe: () => subscription.unsubscribe(),
		};
	}

	stop(): void {
		this.actor.stop();
	}
}
