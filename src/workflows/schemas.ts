import { z } from "zod";

export const ChoiceTransitionSchema = z.object({
	type: z.literal("choice"),
	targetId: z.string().min(1),
	buttonText: z.string().min(1),
});

export const RandomTransitionSchema = z.object({
	type: z.literal("random"),
	targetId: z.string().min(1),
	weight: z.number().positive(),
});

export const DirectTransitionSchema = z.object({
	type: z.literal("direct"),
	targetId: z.string().min(1),
});

export const TransitionSchema = z.discriminatedUnion("type", [
	ChoiceTransitionSchema,
	RandomTransitionSchema,
	DirectTransitionSchema,
]);

export const WorkflowNodeSchema = z.object({
	id: z.string().min(1),
	audioPath: z.string().min(1),
	transitions: z.array(TransitionSchema),
});

export const WorkflowSchema = z.object({
	workflowId: z.string().uuid().or(z.string().min(1)), // UUID or simple ID
	initialNodeId: z.string().min(1),
	nodes: z.record(z.string(), WorkflowNodeSchema),
});
