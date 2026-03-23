import { motion } from "framer-motion";
// import { LucideIcon } from "lucide-react";

// interface PlatformCardProps {
//   icon: LucideIcon;
//   title: string;
//   subtitle: string;
//   active: boolean;
//   version?: string;
//   buildNumber?: string;
//   size?: string;
//   architecture?: string;
//   onDownload?: () => void;
//   onNotify?: () => void;
// }

const transition = { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] };

const PlatformCard = ({
  icon,
  title,
  subtitle,
  active,
  version,
  buildNumber,
  size,
  architecture,
  onDownload,
  onNotify,
}) => {
  if (!active) {
    return (
      <div className="relative flex flex-col gap-4 p-6 rounded-[16px] bg-card border border-dashed border-muted opacity-60 cursor-not-allowed">
        <div className="absolute top-4 right-4">
          <span className="inline-block px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium uppercase tracking-widest">
            Coming Soon
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-[12px] bg-muted">
            {/* <Icon className="w-5 h-5 text-muted-foreground" /> */}
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
            <p className="metadata">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onNotify}
          className="mt-auto h-11 px-6 rounded-[8px] bg-muted text-muted-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-accent transition-colors"
        >
          Notify Me
        </button>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={transition}
      className="relative flex flex-col gap-4 p-6 rounded-[16px] bg-card will-change-transform"
      style={{ boxShadow: "var(--shadow-card)" }}
      onHoverStart={(e) => {
        (e.target).closest('[style]')?.style.setProperty('box-shadow', 'var(--shadow-card-hover)');
      }}
      onHoverEnd={(e) => {
        (e.target).closest('[style]')?.style.setProperty('box-shadow', 'var(--shadow-card)');
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-[12px] bg-primary/10">
          {/* <Icon className="w-5 h-5 text-primary" /> */}
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="metadata">{subtitle}</p>
        </div>
      </div>

      {version && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 metadata">
          <span>Version {version}</span>
          {buildNumber && <span>• Build {buildNumber}</span>}
          {size && <span>• {size}</span>}
          {architecture && <span>• {architecture}</span>}
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onDownload}
        className="mt-auto h-11 px-6 rounded-[8px] bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      >
        Download APK
      </motion.button>
    </motion.div>
  );
};

export default PlatformCard;
