import { assign, createMachine } from "xstate";
import type { RandomTransition, Workflow } from "./types";

export interface WorkflowContext {
	workflow: Workflow;
	currentNodeId: string | null;
	history: string[];
}

export type WorkflowEvent =
	| { type: "START"; startNodeId?: string }
	| { type: "PLAY" }
	| { type: "PAUSE" }
	| { type: "AUDIO_ENDED" }
	| { type: "SELECT_CHOICE"; targetId: string };

function pickRandomTarget(transitions: RandomTransition[]): string {
	const totalWeight = transitions.reduce((sum, t) => sum + t.weight, 0);
	let r = Math.random() * totalWeight;
	for (const t of transitions) {
		r -= t.weight;
		if (r <= 0) {
			return t.targetId;
		}
	}
	return transitions[transitions.length - 1].targetId;
}

export const createWorkflowMachine = (workflow: Workflow) => {
	return createMachine({
		types: {} as {
			context: WorkflowContext;
			events: WorkflowEvent;
		},
		id: "workflowEngine",
		initial: "idle",
		context: {
			workflow,
			currentNodeId: null,
			history: [],
		},
		states: {
			idle: {
				on: {
					START: {
						target: "playing",
						actions: assign(({ context, event }) => {
							const targetNodeId =
								event.startNodeId || context.workflow.initialNodeId;
							return {
								currentNodeId: targetNodeId,
								history: [targetNodeId],
							};
						}),
					},
				},
			},
			playing: {
				on: {
					PAUSE: "paused",
					AUDIO_ENDED: [
						{
							guard: ({ context }) => {
								const node = context.currentNodeId
									? context.workflow.nodes[context.currentNodeId]
									: null;
								return !node || node.transitions.length === 0;
							},
							target: "completed",
						},
						{
							guard: ({ context }) => {
								const node = context.currentNodeId
									? context.workflow.nodes[context.currentNodeId]
									: null;
								return node?.transitions[0]?.type === "choice";
							},
							target: "waitingForChoice",
						},
						{
							guard: ({ context }) => {
								const node = context.currentNodeId
									? context.workflow.nodes[context.currentNodeId]
									: null;
								return (
									node?.transitions[0]?.type === "direct" ||
									node?.transitions[0]?.type === "random"
								);
							},
							target: "playing",
							actions: assign(({ context }) => {
								const node = context.currentNodeId
									? context.workflow.nodes[context.currentNodeId]
									: null;
								if (!node) return {};
								let nextNodeId = "";
								if (node.transitions[0].type === "direct") {
									nextNodeId = node.transitions[0].targetId;
								} else {
									const randomTransitions =
										node.transitions as RandomTransition[];
									nextNodeId = pickRandomTarget(randomTransitions);
								}
								return {
									currentNodeId: nextNodeId,
									history: [...context.history, nextNodeId],
								};
							}),
						},
					],
				},
			},
			paused: {
				on: {
					PLAY: "playing",
				},
			},
			waitingForChoice: {
				on: {
					SELECT_CHOICE: {
						target: "playing",
						actions: assign(({ context, event }) => {
							return {
								currentNodeId: event.targetId,
								history: [...context.history, event.targetId],
							};
						}),
					},
				},
			},
			completed: {
				type: "final",
			},
		},
	});
};
