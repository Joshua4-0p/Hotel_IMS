import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface AccordionItemProps {
  question: string;
  answer: string;
}

export function AccordionItem({ question, answer }: AccordionItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="border-b border-[#E3E3E3] py-5 cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="heading-md text-[#000000]">{question}</span>
        <span className="shrink-0 text-[#585858]">
          {open ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="body-md text-[#585858] pt-3 pb-1">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
