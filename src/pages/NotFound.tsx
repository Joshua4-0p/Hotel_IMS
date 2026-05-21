import { motion } from 'framer-motion';
import { Btn } from '../components/Btn';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div
        className="text-center flex flex-col items-center gap-6 px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <span className="display-xl text-[#000000]">404</span>
        <h1 className="heading-lg text-[#000000]">Oops! Page Not Found</h1>
        <p className="body-lg text-[#585858] max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Btn to="/" variant="primary" size="lg">
          Back to Home
        </Btn>
      </motion.div>
    </div>
  );
}
