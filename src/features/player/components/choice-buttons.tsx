import { useAudioStore } from "@/stores/use-audio-store";

export function ChoiceButtons() {
	const engineState = useAudioStore((state) => state.engineState);
	const selectChoice = useAudioStore((state) => state.selectChoice);

	if (!engineState || engineState.status !== "waitingForChoice") {
		return null;
	}

	const { choices } = engineState;
	if (choices.length === 0) return null;

	// Distribute heights evenly using CSS flex-col and flex-1
	return (
		<div className="flex flex-col flex-1 w-full gap-2 p-2 min-h-0">
			{choices.map((choice, index) => {
				// Cycle through distinct background colors for visual clarity
				const bgColors = [
					"bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-indigo-50 border-indigo-700",
					"bg-teal-600 hover:bg-teal-500 active:scale-98 text-teal-50 border-teal-700",
					"bg-rose-600 hover:bg-rose-500 active:scale-98 text-rose-50 border-rose-700",
					"bg-amber-600 hover:bg-amber-500 active:scale-98 text-amber-50 border-amber-700",
				];
				const colorClass = bgColors[index % bgColors.length];

				return (
					<button
						key={choice.targetId}
						type="button"
						onClick={() => selectChoice(choice.targetId)}
						className={`flex-1 flex flex-col justify-center items-center p-6 rounded-2xl border-b-4 transition-all shadow-md active:translate-y-0.5 cursor-pointer ${colorClass}`}
					>
						<span className="text-xl font-bold tracking-wide text-center leading-snug">
							{choice.buttonText}
						</span>
						<span className="text-xs opacity-70 mt-1 font-mono uppercase tracking-wider">
							Route to: {choice.targetId}
						</span>
					</button>
				);
			})}
		</div>
	);
}
