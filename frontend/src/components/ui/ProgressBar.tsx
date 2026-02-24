interface ProgressBarProps {
  current: number;
  target: number;
  complete?: boolean;
}

const ProgressBar = ({ current, target, complete }: ProgressBarProps) => {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={current}
        aria-label={`${Math.round(pct)}% собрано`}
      >
        <div
          className={`h-full rounded-full transition-all ${complete ? "bg-success" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-neutral-500">
        {formatPrice(current)} / {formatPrice(target)} ₽ ({Math.round(pct)}%)
      </span>
    </div>
  );
};

const formatPrice = (kopecks: number) =>
  (kopecks / 100).toLocaleString("ru-RU", { maximumFractionDigits: 0 });

export default ProgressBar;
