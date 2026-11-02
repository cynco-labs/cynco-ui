export const StepBadge = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="w-6 h-6 p-2.5 bg-interactive-secondary rounded-md shadow-bevel border inline-flex justify-center items-center gap-2.5">
			<div className="justify-start text-primary text-sm font-semibold font-['Inter']">
				{children}
			</div>
		</div>
	);
};
