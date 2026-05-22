import { Clock } from 'lucide-react';

export function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="w-14 h-14 rounded-[14px] bg-[#f3f4f6] dark:bg-[#2a2a2a] flex items-center justify-center">
        <Clock size={24} className="text-[#9ca3af]" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-[#111111] dark:text-white">{title}</h1>
        <p className="text-sm text-[#585858] dark:text-[#9ca3af] mt-1 max-w-xs">
          This section is coming in an upcoming stage of the admin panel.
        </p>
      </div>
    </div>
  );
}
