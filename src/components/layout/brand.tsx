export function Brand() {
  return (
    <div className="flex items-center gap-2 px-4 py-5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/church-symbol.png" alt="" className="size-[22px] object-contain" />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold tracking-tight text-white">
          LA Central Church
        </p>
        <p className="truncate text-xs text-slate-400">성도 교제</p>
      </div>
    </div>
  );
}
