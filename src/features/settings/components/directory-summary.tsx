interface DirectorySummaryProps {
	directoryName: string | null;
	filesCount: number;
}

export function DirectorySummary({
	directoryName,
	filesCount,
}: DirectorySummaryProps) {
	if (filesCount === 0) return null;

	return (
		<div className="mt-2 p-3 bg-muted rounded-lg border text-sm text-muted-foreground w-full">
			<p className="font-semibold text-foreground">
				{directoryName
					? `Directory: ${directoryName}`
					: "Loaded files in memory"}
			</p>
			<p className="text-xs mt-1">Found {filesCount} file(s)</p>
		</div>
	);
}
