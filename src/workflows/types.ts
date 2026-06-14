export type TransitionType = "choice" | "random" | "direct";

export interface BaseTransition {
	type: TransitionType;
	targetId: string;
}

export interface ChoiceTransition extends BaseTransition {
	type: "choice";
	buttonText: string;
}

export interface RandomTransition extends BaseTransition {
	type: "random";
	weight: number;
}

export interface DirectTransition extends BaseTransition {
	type: "direct";
}

export type Transition = ChoiceTransition | RandomTransition | DirectTransition;

export interface WorkflowNode {
	id: string;
	audioPath: string;
	transitions: Transition[];
}

export interface Workflow {
	workflowId: string;
	initialNodeId: string;
	nodes: Record<string, WorkflowNode>;
}

export type PlaybackState =
	| "idle"
	| "playing"
	| "paused"
	| "waitingForChoice"
	| "completed";

export interface EngineState {
	status: PlaybackState;
	currentNodeId: string | null;
	currentAudioPath: string | null;
	choices: ChoiceTransition[];
	history: string[];
}
