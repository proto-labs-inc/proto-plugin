export const MOCK_PROJECT = {
  name: "Default Project",
  apiUrl: "http://127.0.0.1:54321",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
} as const;

export type SqlExample = {
  id: string;
  title: string;
  description: string;
};

/** Quickstart examples from source `SQL_TEMPLATES` (type: quickstart), excluding templates. */
export const SQL_EXAMPLES: SqlExample[] = [
  {
    id: "colors",
    title: "Colors",
    description: "Create a table with a list of colors and their hex values.",
  },
  {
    id: "slack-clone",
    title: "Slack Clone",
    description: "Build a basic slack clone with Row Level Security.",
  },
  {
    id: "todo-list",
    title: "Todo List",
    description: "Build a basic todo list with Row Level Security.",
  },
  {
    id: "stripe-subscriptions",
    title: "Stripe Subscriptions",
    description: "Starter template for the Next.js Stripe Subscriptions Starter.",
  },
  {
    id: "user-management-starter",
    title: "User Management Starter",
    description: "Sets up a public Profiles table which you can access with your API.",
  },
  {
    id: "nextauth-schema-setup",
    title: "NextAuth Schema Setup",
    description: "Sets up a the Schema and Tables for the NextAuth Supabase Adapter.",
  },
  {
    id: "openai-vector-search",
    title: "OpenAI Vector Search",
    description: "Template for the Next.js OpenAI Doc Search Starter.",
  },
  {
    id: "langchain",
    title: "LangChain",
    description: "LangChain is a popular framework for working with AI, Vectors, and embeddings.",
  },
  {
    id: "instruments",
    title: "Instruments",
    description:
      "Create an instruments table with sample data and Row Level Security, as used in the framework quickstarts.",
  },
];
