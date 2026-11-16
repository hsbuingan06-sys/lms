export function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.trim().split(/\s+/).slice(-2).map(x => x[0]).join('').toUpperCase();
  const colors = ['bg-[#dce9df] text-[#365642]', 'bg-[#f3e3d5] text-[#8c5138]', 'bg-[#e7e1ef] text-[#62517a]', 'bg-[#dce8f2] text-[#2c4e6e]'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-bold ${
        size === 'md' ? 'h-11 w-11 text-xs' : 'h-8 w-8 text-[10px]'
      } ${color}`}
    >
      {initials}
    </span>
  );
}
