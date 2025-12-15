import React from "react";
import { motion } from "framer-motion";

export default function AnimatedMessage({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-yellow-100 text-yellow-900 px-4 py-2 rounded-lg shadow-md font-medium text-center mb-6"
    >
      {message}
    </motion.div>
  );
}
