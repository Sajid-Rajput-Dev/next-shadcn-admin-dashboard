
import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[30rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-2xl transition duration-500 shadow-input dark:shadow-none dark:bg-black dark:border-white/10 bg-white border border-transparent flex flex-col overflow-hidden",
        className
      )}
    >
      <div className="w-full h-80 overflow-hidden relative">
        {header}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 pointer-events-none" />
      </div>
      <div className="p-6 flex flex-col flex-1 group-hover/bento:translate-x-1 transition duration-200">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 text-lg">
            {title}
          </div>
        </div>
        <div className="font-sans font-normal text-neutral-600 text-sm dark:text-neutral-400">
          {description}
        </div>
      </div>
    </div>
  );
};
