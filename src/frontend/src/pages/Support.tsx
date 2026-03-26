import { BookOpen, MessageCircle, Minus, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const FAQS = [
  {
    id: "how-it-works",
    question: "How does wallet recovery work?",
    answer:
      "Brute Crypto uses a combination of advanced brute-force algorithms, dictionary attacks, and key derivation analysis to systematically test millions of possible access combinations for your wallet. Our engine scans selected blockchain networks in real-time, testing private keys derived from various seed phrase permutations and password combinations until a match is found or the scan completes.",
  },
  {
    id: "data-security",
    question: "Is my data secure?",
    answer:
      "All processing happens locally on your machine \u2014 we never transmit your private keys, seed phrases, or wallet data to our servers. Your activation key is stored only in your browser's localStorage. The recovery process is entirely client-side, ensuring maximum privacy and security. We do not log or store any wallet information you recover.",
  },
  {
    id: "supported-chains",
    question: "What blockchains are supported?",
    answer:
      "We currently support 7 major blockchain networks: Bitcoin (BTC), Ethereum (ETH), Solana (SOL), BNB Chain (BNB), Polygon (MATIC), Avalanche (AVAX), and Tron (TRX). Each network uses its own key derivation standard and our engine handles all the technical differences automatically.",
  },
  {
    id: "scan-duration",
    question: "How long does a scan take?",
    answer:
      "A standard scan runs for approximately 60 seconds per session, testing thousands of key combinations per second. The duration depends on the number of chains selected and the complexity of your recovery scenario. For partial seed phrase recovery, we recommend running multiple scans across different derivation paths. Most successful recoveries are completed within 5\u201315 scan sessions.",
  },
];

function FAQItem({
  id,
  question,
  answer,
  index,
}: { id: string; question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="border-b border-border last:border-0"
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        data-ocid={`support.faq.item.${index + 1}`}
        aria-expanded={open}
        aria-controls={`faq-answer-${id}`}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
      >
        <span className="font-medium text-sm text-foreground group-hover:opacity-70 transition-opacity">
          {question}
        </span>
        {open ? (
          <Minus
            size={15}
            className="shrink-0 text-muted-foreground transition-all duration-200"
          />
        ) : (
          <Plus
            size={15}
            className="shrink-0 text-muted-foreground transition-all duration-200"
          />
        )}
      </button>
      {open && (
        <motion.div
          id={`faq-answer-${id}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <p className="text-sm text-muted-foreground leading-relaxed pb-5">
            {answer}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Support() {
  return (
    <div className="section-padding">
      <div className="container-brute">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
            Help Center
          </p>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-16">
            Support
          </h1>

          <div className="max-w-2xl space-y-8">
            {/* FAQ */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <BookOpen size={18} className="text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="bg-card rounded-2xl border border-border px-6">
                {FAQS.map((faq, i) => (
                  <FAQItem
                    key={faq.id}
                    id={faq.id}
                    question={faq.question}
                    answer={faq.answer}
                    index={i}
                  />
                ))}
              </div>
            </div>

            {/* Telegram Contact */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="p-6 bg-card rounded-2xl border border-border"
            >
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle size={18} className="text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">
                  Still have questions?
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Reach out to our support team directly on Telegram. We typically
                respond within a few hours.
              </p>
              <a
                href="https://t.me/brutecryptoadm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-semibold hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <MessageCircle size={15} />
                Contact @brutecryptoadm
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
