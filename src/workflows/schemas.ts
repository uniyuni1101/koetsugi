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

export const WorkflowNodeSchema = z
	.object({
		id: z.string().min(1),
		audioPath: z.string().min(1),
		transitions: z.array(TransitionSchema),
	})
	.superRefine((node, ctx) => {
		if (node.transitions.length > 0) {
			const firstType = node.transitions[0].type;
			const hasMixedTypes = node.transitions.some((t) => t.type !== firstType);
			if (hasMixedTypes) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["transitions"],
					message: `Node "${node.id}" has mixed transition types. All transitions in a node must have the same type.`,
				});
			}

			if (firstType === "direct" && node.transitions.length > 1) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["transitions"],
					message: `Node "${node.id}" has type "direct" but contains multiple transitions. "direct" nodes must have exactly one transition.`,
				});
			}
		}
	});

export const WorkflowSchema = z
	.object({
		workflowId: z.string().uuid().or(z.string().min(1)), // UUID or simple ID
		initialNodeId: z.string().min(1),
		nodes: z.record(z.string(), WorkflowNodeSchema),
	})
	.superRefine((data, ctx) => {
		// 1. Check if initialNodeId exists
		if (!data.nodes[data.initialNodeId]) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["initialNodeId"],
				message: `Initial node ID "${data.initialNodeId}" does not exist in nodes.`,
			});
		}

		// 2. Check each node's key matching and transition targets
		for (const [nodeId, node] of Object.entries(data.nodes)) {
			if (node.id !== nodeId) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["nodes", nodeId, "id"],
					message: `Node key "${nodeId}" does not match its internal id "${node.id}".`,
				});
			}

			for (let i = 0; i < node.transitions.length; i++) {
				const transition = node.transitions[i];
				if (!data.nodes[transition.targetId]) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ["nodes", nodeId, "transitions", i, "targetId"],
						message: `Transition target "${transition.targetId}" in node "${nodeId}" does not exist.`,
					});
				}
			}
		}
	});
