import { motion } from "framer-motion";
// import { Smartphone, Tv, Monitor, Apple } from "lucide-react";
// import { toast } from "sonner";
import Swal from "sweetalert2";
import PlatformCard from "../midlleware/platformcard";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faMobileAlt, faPhone, faTv, faTvAlt } from "@fortawesome/free-solid-svg-icons";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
};

const platforms = [
  {
    icon: <FontAwesomeIcon icon={faPhone}/>,
    title: "Android Mobile",
    subtitle: "ARM64 • Android 8.0+",
    active: true,
    version: "2.4.1",
    buildNumber: "882",
    size: "42.8 MB",
    architecture: "arm64-v8a",
  },
  {
    icon: <FontAwesomeIcon icon={faTvAlt}/>,
    title: "Android TV",
    subtitle: "ARM64 • Android TV 9.0+",
    active: true,
    version: "2.4.1",
    buildNumber: "882",
    size: "45.2 MB",
    architecture: "arm64-v8a",
  },
  {
    icon: <FontAwesomeIcon icon={faTv}/>,
    title: "Samsung TV (Tizen)",
    subtitle: "Tizen OS 5.0+",
    active: false,
  },
  {
    icon: <FontAwesomeIcon icon={faMobileAlt}/>,
    title: "iOS",
    subtitle: "iPhone & iPad • iOS 15+",
    active: false,
  },
];

const Index = () => {
  const handleDownload = (platform) => {
    // toast.success(`Starting download for ${platform}...`, {
    //   description: "Your APK file will begin downloading shortly.",
    // });
    Swal.fire({
        icon: 'info',
        title: 'Your APK file will begin downloading shortly.',
        showConfirmButton: false,
        timer: 1500
    })
  };

  const handleNotify = (platform) => {
    // toast.success(`We'll notify you when ${platform} is available.`);
    Swal.fire({
        icon: 'info',
        title: `We'll notify you when ${platform} is available.`,
        showConfirmButton: false,
        timer: 1500
    })
  };

  return (
    <div className="w-[100%] h-[100%] bg-background">
      <div className="max-w-4xl mx-auto px-6 py-[10vh]">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-12"
        >
          {/* Header */}
          <motion.header variants={item} className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground" style={{ letterSpacing: "-0.02em" }}>
              Take your cinema with you.
            </h1>
            <p className="text-base text-muted-foreground max-w-lg leading-relaxed">
              Direct downloads for Android ecosystems. Native apps for iOS and Tizen (Samsung) are currently in development.
            </p>
          </motion.header>

          {/* Distribution Grid */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platforms.map((platform) => (
              <PlatformCard
                key={platform.title}
                {...platform}
                onDownload={() => handleDownload(platform.title)}
                onNotify={() => handleNotify(platform.title)}
              />
            ))}
          </motion.div>

          {/* Footer metadata */}
          <motion.footer variants={item} className="metadata text-center">
            SHA-256 verified • All builds are signed and verified for integrity
          </motion.footer>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
