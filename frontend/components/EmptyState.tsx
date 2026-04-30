export const EmptyState = ({ title }: { title: string }) => {
  return (
    <div className="flex min-h-[320px] items-center justify-center p-8 text-center">
      <div>
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          Your shortened URLs will appear here with quick actions for copying,
          editing, and deleting.
        </p>
      </div>
    </div>
  );
};
