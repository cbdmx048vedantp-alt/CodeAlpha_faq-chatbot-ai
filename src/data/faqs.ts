
export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}

export const FAQ_DATASET: FAQItem[] = [
  {
    category: "General",
    question: "What is the FAQ Chatbot?",
    answer: "The FAQ Chatbot is an intelligent assistant designed to help you find answers to common questions efficiently using advanced Natural Language Processing.",
    tags: ["about", "info", "definition"]
  },
  {
    category: "Technical",
    question: "How does the search matching work?",
    answer: "We use TF-IDF vectorization and Cosine Similarity to compare your query against our dataset. This allows us to understand the semantic relevance of your questions.",
    tags: ["tech", "how it works", "algorithm"]
  },
  {
    category: "General",
    question: "What are your business hours?",
    answer: "Our support team is available Monday through Friday, from 9:00 AM to 6:00 PM EST.",
    tags: ["hours", "time", "support"]
  },
  {
    category: "Account",
    question: "How do I reset my password?",
    answer: "To reset your password, click on the 'Forgot Password' link on the login page and follow the instructions sent to your registered email address.",
    tags: ["password", "account", "security"]
  },
  {
    category: "Account",
    question: "Can I change my subscription plan?",
    answer: "Yes, you can upgrade or downgrade your plan at any time through the 'Billing' section in your account settings.",
    tags: ["billing", "subscription", "plan", "upgrade"]
  },
  {
    category: "General",
    question: "Where is your company located?",
    answer: "Our headquarters are located in San Francisco, California, but we have a global remote-first team.",
    tags: ["location", "office", "address"]
  },
  {
    category: "Account",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers.",
    tags: ["payment", "credit card", "billing"]
  },
  {
    category: "Technical",
    question: "Is there a mobile app available?",
    answer: "Yes, our mobile app is available for download on both the Apple App Store and Google Play Store.",
    tags: ["mobile", "app", "download", "ios", "android"]
  },
  {
    category: "General",
    question: "How can I contact customer support?",
    answer: "Yuo can reach us via email at support@example.com or through the live chat feature on our website.",
    tags: ["contact", "support", "help"]
  },
  {
    category: "Technical",
    question: "Do you offer an API for integration?",
    answer: "Yes, we offer a comprehensive REST API for developers. You can find the documentation in our Developer Portal.",
    tags: ["api", "developer", "integration"]
  }
];
