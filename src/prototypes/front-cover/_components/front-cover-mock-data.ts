import type { FrontCoverDashboardTab, FrontCoverFrameworkId } from "./front-cover-types";

export const HERO_COPY = {
  lineOne: "Build in a weekend",
  lineTwo: "Scale to millions",
  body: "Start your project with a Postgres database. Add Authentication, Data APIs, Edge Functions, Realtime Data, Storage, and Vector embeddings.",
  primaryCta: "Start your project",
  secondaryCta: "Request a demo",
} as const;

export const PRODUCT_ICON_PATHS = {
  database:
    "M5.18625 8.66531H19.5035V15.331H5.18625V8.66531Z M4 17.0007C4 16.0804 4.7461 15.3343 5.66645 15.3343H18.9984C19.9187 15.3343 20.6648 16.0804 20.6648 17.0007V20.3335C20.6648 21.2539 19.9187 22 18.9984 22H5.66646C4.7461 22 4 21.2539 4 20.3335V17.0007Z M4 3.66646C4 2.7461 4.7461 2 5.66645 2H18.9984C19.9187 2 20.6648 2.7461 20.6648 3.66645V6.99926C20.6648 7.91962 19.9187 8.66572 18.9984 8.66572H5.66646C4.7461 8.66572 4 7.91962 4 6.99926V3.66646Z",
  authentication:
    "M5.03305 15.8071H12.7252M5.03305 15.8071V18.884H12.7252V15.8071M5.03305 15.8071V12.7302H12.7252V15.8071M15.0419 8.15385V5.07692C15.0419 3.37759 13.6643 2 11.965 2C10.2657 2 8.88814 3.37759 8.88814 5.07692V8.15385M5 11.2307L5 18.9231C5 20.6224 6.37757 22 8.07689 22H15.769C17.4683 22 18.8459 20.6224 18.8459 18.9231V11.2307C18.8459 9.53142 17.4683 8.15385 15.769 8.15385L8.07689 8.15385C6.37757 8.15385 5 9.53142 5 11.2307Z",
  functions:
    "M6.6594 21.8201C8.10788 22.5739 9.75418 23 11.5 23C17.299 23 22 18.299 22 12.5C22 10.7494 21.5716 9.09889 20.8139 7.64754M16.4016 3.21191C14.9384 2.43814 13.2704 2 11.5 2C5.70101 2 1 6.70101 1 12.5C1 14.287 1.44643 15.9698 2.23384 17.4428M2.23384 17.4428C1.81058 17.96 1.55664 18.6211 1.55664 19.3416C1.55664 20.9984 2.89979 22.3416 4.55664 22.3416C6.21349 22.3416 7.55664 20.9984 7.55664 19.3416C7.55664 17.6847 6.21349 16.3416 4.55664 16.3416C3.62021 16.3416 2.78399 16.7706 2.23384 17.4428ZM21.5 5.64783C21.5 7.30468 20.1569 8.64783 18.5 8.64783C16.8432 8.64783 15.5 7.30468 15.5 5.64783C15.5 3.99097 16.8432 2.64783 18.5 2.64783C20.1569 2.64783 21.5 3.99097 21.5 5.64783ZM18.25 12.5C18.25 16.2279 15.2279 19.25 11.5 19.25C7.77208 19.25 4.75 16.2279 4.75 12.5C4.75 8.77208 7.77208 5.75 11.5 5.75C15.2279 5.75 18.25 8.77208 18.25 12.5Z",
  storage:
    "M20.4997 12.1386V9.15811L14.8463 3.53163H6.43717C5.57423 3.53163 4.87467 4.23119 4.87467 5.09413V9.78087M20.4447 9.13199L14.844 3.53125L14.844 7.56949C14.844 8.43243 15.5436 9.13199 16.4065 9.13199L20.4447 9.13199ZM7.12729 9.78087H4.83398C3.97104 9.78087 3.27148 10.4804 3.27148 11.3434V19.1559C3.27148 20.8818 4.67059 22.2809 6.39648 22.2809H18.8965C20.6224 22.2809 22.0215 20.8818 22.0215 19.1559V13.7011C22.0215 12.8381 21.3219 12.1386 20.459 12.1386H10.8032C10.3933 12.1386 9.99969 11.9774 9.70743 11.6899L8.22312 10.2296C7.93086 9.94202 7.53729 9.78087 7.12729 9.78087Z",
  realtime:
    "M9.15928 1.94531V5.84117M6.24345 5.84117L2.91385 2.40977M6.24345 8.53673H2.4248M16.7998 16.496L21.9988 15.2019C22.7217 15.022 22.8065 14.0285 22.1246 13.7286L9.73411 8.28034C9.08269 7.99391 8.41873 8.65652 8.70383 9.30851L14.0544 21.5445C14.3518 22.2247 15.341 22.1456 15.5266 21.4269L16.7998 16.496Z",
  vector:
    "M11.9983 11.4482V21.7337M11.9983 11.4482L21.0732 6.17699M11.9983 11.4482L2.92383 6.17723M2.92383 6.17723V12.4849M2.92383 6.17723V6.1232L8.35978 2.9657M21.0736 12.54V6.1232L15.6376 2.9657M17.7247 18.6107L11.9987 21.9367L6.27265 18.6107",
  "data-api":
    "M4.13477 12.8129C4.13477 14.1481 4.43245 15.4138 4.96506 16.5471M12.925 4.02271C11.5644 4.02271 10.276 4.33184 9.12614 4.88371M21.7152 12.8129C21.7152 11.4644 21.4115 10.1867 20.8688 9.0447M12.925 21.6032C14.2829 21.6032 15.5689 21.2952 16.717 20.7454M16.717 20.7454C17.2587 21.5257 18.1612 22.0366 19.1831 22.0366C20.84 22.0366 22.1831 20.6935 22.1831 19.0366C22.1831 17.3798 20.84 16.0366 19.1831 16.0366C17.5263 16.0366 16.1831 17.3798 16.1831 19.0366C16.1831 19.6716 16.3804 20.2605 16.717 20.7454ZM4.96506 16.5471C4.16552 17.086 3.63965 17.9999 3.63965 19.0366C3.63965 20.6935 4.98279 22.0366 6.63965 22.0366C8.2965 22.0366 9.63965 20.6935 9.63965 19.0366C9.63965 17.3798 8.2965 16.0366 6.63965 16.0366C6.01951 16.0366 5.44333 16.2248 4.96506 16.5471ZM9.12614 4.88371C8.58687 4.08666 7.67444 3.56274 6.63965 3.56274C4.98279 3.56274 3.63965 4.90589 3.63965 6.56274C3.63965 8.2196 4.98279 9.56274 6.63965 9.56274C8.2965 9.56274 9.63965 8.2196 9.63965 6.56274C9.63965 5.94069 9.45032 5.36285 9.12614 4.88371ZM20.8688 9.0447C21.6621 8.50486 22.1831 7.59464 22.1831 6.56274C22.1831 4.90589 20.84 3.56274 19.1831 3.56274C17.5263 3.56274 16.1831 4.90589 16.1831 6.56274C16.1831 8.2196 17.5263 9.56274 19.1831 9.56274C19.8081 9.56274 20.3884 9.37165 20.8688 9.0447Z",
  cron: "M12 6.375V12H16.2188M21.375 12C21.375 17.1777 17.1777 21.375 12 21.375C6.82233 21.375 2.625 17.1777 2.625 12C2.625 6.82233 6.82233 2.625 12 2.625C17.1777 2.625 21.375 6.82233 21.375 12Z",
  queues:
    "M17.625 16.2902C17.625 17.0274 17.0274 17.625 16.2902 17.625H9.375C7.71815 17.625 6.375 16.2819 6.375 14.625V8.14725C6.375 7.16846 7.16846 6.375 8.14725 6.375M13.125 20.7902C13.125 21.5274 12.5274 22.125 11.7902 22.125H4.875C3.21815 22.125 1.875 20.7819 1.875 19.125V12.6472C1.875 11.6685 2.66846 10.875 3.64725 10.875M13.875 13.125H19.125C20.7819 13.125 22.125 11.7819 22.125 10.125V4.875C22.125 3.21815 20.7819 1.875 19.125 1.875H13.875C12.2181 1.875 10.875 3.21815 10.875 4.875V10.125C10.875 11.7819 12.2181 13.125 13.875 13.125Z",
} as const;

export const PRODUCT_CARDS = [
  {
    id: "database",
    title: "Postgres Database",
    subtitle:
      "Every project is a full Postgres database, the world's most trusted relational database.",
    highlights: ["100% portable", "Built-in Auth with RLS", "Easy to extend"],
    icon: PRODUCT_ICON_PATHS.database,
    visual: "database" as const,
    span: "wide" as const,
  },
  {
    id: "authentication",
    title: "Authentication",
    subtitle: "Add user sign ups and logins, securing your data with Row Level Security.",
    icon: PRODUCT_ICON_PATHS.authentication,
    visual: "auth" as const,
    span: "narrow" as const,
  },
  {
    id: "functions",
    title: "Edge Functions",
    subtitle: "Easily write custom code without deploying or scaling servers.",
    icon: PRODUCT_ICON_PATHS.functions,
    visual: "functions" as const,
    span: "narrow" as const,
  },
  {
    id: "storage",
    title: "Storage",
    subtitle: "Store, organize, and serve large files, from videos to images.",
    icon: PRODUCT_ICON_PATHS.storage,
    visual: "storage" as const,
    span: "narrow" as const,
  },
  {
    id: "realtime",
    title: "Realtime",
    subtitle: "Build multiplayer experiences with real-time data synchronization.",
    icon: PRODUCT_ICON_PATHS.realtime,
    visual: "realtime" as const,
    span: "narrow" as const,
  },
  {
    id: "vector",
    title: "Vector",
    subtitle: "Integrate your favorite ML-models to store, index and search vector embeddings.",
    highlights: ["OpenAI", "Hugging Face"],
    icon: PRODUCT_ICON_PATHS.vector,
    visual: "vector" as const,
    span: "narrow" as const,
  },
  {
    id: "data-api",
    title: "Data APIs",
    subtitle: "Instant ready-to-use REST APIs.",
    icon: PRODUCT_ICON_PATHS["data-api"],
    visual: "data-api" as const,
    span: "narrow" as const,
  },
] as const;

export const PRODUCT_NAV_ITEMS = [
  { title: "Database", description: "Fully portable Postgres database", icon: PRODUCT_ICON_PATHS.database },
  { title: "Authentication", description: "User Management out of the box", icon: PRODUCT_ICON_PATHS.authentication },
  { title: "Storage", description: "Serverless storage for any media", icon: PRODUCT_ICON_PATHS.storage },
  { title: "Edge Functions", description: "Deploy code globally on the edge", icon: PRODUCT_ICON_PATHS.functions },
  { title: "Realtime", description: "Synchronize and broadcast events", icon: PRODUCT_ICON_PATHS.realtime },
] as const;

export const PRODUCT_MODULE_NAV_ITEMS = [
  { title: "Vector", description: "AI toolkit to manage embeddings", icon: PRODUCT_ICON_PATHS.vector },
  { title: "Cron", description: "Schedule and manage recurring Jobs", icon: PRODUCT_ICON_PATHS.cron },
  { title: "Queues", description: "Durable Message Queues with guaranteed delivery", icon: PRODUCT_ICON_PATHS.queues },
] as const;

export const DEVELOPER_NAV_ITEMS = [
  { title: "Documentation", description: "Guides, references, and API docs" },
  { title: "Contribute", description: "How to contribute to Supabase." },
  { title: "Changelog", description: "See the latest updates and product improvements." },
  { title: "Support", description: "Get help from the team and community." },
] as const;

export const DEVELOPER_RESOURCE_ITEMS = [
  { title: "Open Source", description: "We support existing open source tools and communities." },
  { title: "Become a Partner", description: "Offer your integration on the marketplace." },
  { title: "Integrations", description: "Extend Supabase with partner tools." },
] as const;

export const SOLUTION_NAV_ITEMS = [
  { title: "AI Builders" },
  { title: "No Code" },
  { title: "Beginners" },
  { title: "Developers" },
  { title: "Startups" },
  { title: "Enterprise" },
  { title: "Agencies" },
  { title: "Healthcare" },
] as const;

export const TRUSTED_LOGOS = [
  "Betashares",
  "Bolt",
  "Chatbase",
  "Figma",
  "GitHub",
  "Lovable",
  "Mozilla",
  "Pika",
  "Resend",
  "v0",
  "LangChain",
  "Mobbin",
] as const;

export const DASHBOARD_TABS: Array<{
  id: FrontCoverDashboardTab;
  label: string;
}> = [
  { id: "table-editor", label: "Table Editor" },
  { id: "sql-editor", label: "SQL Editor" },
  { id: "rls", label: "RLS Policies" },
];

export const DASHBOARD_TITLE = {
  lead: "Stay productive and manage your app",
  rest: "without leaving the dashboard",
} as const;

export const FRAMEWORKS: Array<{
  id: FrontCoverFrameworkId;
  name: string;
  snippet: string;
}> = [
  {
    id: "nextjs",
    name: "Next.js",
    snippet: `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)
const { data } = await supabase.from('todos').select()`,
  },
  {
    id: "react",
    name: "React",
    snippet: `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)
const { data } = await supabase.from('profiles').select()`,
  },
  {
    id: "flutter",
    name: "Flutter",
    snippet: `final supabase = Supabase.instance.client;
final data = await supabase.from('todos').select();`,
  },
  {
    id: "svelte",
    name: "Svelte",
    snippet: `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)
const { data } = await supabase.from('posts').select()`,
  },
  {
    id: "python",
    name: "Python",
    snippet: `from supabase import create_client

supabase = create_client(url, key)
data = supabase.table('todos').select('*').execute()`,
  },
  {
    id: "swift",
    name: "Swift",
    snippet: `let client = SupabaseClient(supabaseURL: url, supabaseKey: key)
let todos: [Todo] = try await client.from("todos").select().execute().value`,
  },
];

export const EXAMPLES = [
  { title: "Stripe Subscriptions Starter", stack: "Next.js · Stripe" },
  { title: "Next.js Starter", stack: "Next.js · Auth" },
  { title: "AI Chatbot", stack: "OpenAI · Vector" },
  { title: "LangChain + Next.js Starter", stack: "LangChain · Vector" },
  { title: "Flutter User Management", stack: "Flutter · Auth" },
  { title: "Expo React Native Starter", stack: "Expo · Auth" },
] as const;

export const CUSTOMER_STORIES = [
  {
    id: "firecrawl",
    name: "Firecrawl",
    tagline: "Switched from Pinecone to Supabase Vector to boost efficiency and accuracy.",
    quote:
      "We looked at the alternatives and chose Supabase because it's open source, it's simpler, and for all the ways we need to use it, Supabase has been just as performant.",
    author: "Caleb Peffer, CEO, Firecrawl",
    tone: "warning" as const,
  },
  {
    id: "rally",
    name: "Rally",
    tagline: "From first line of code to fully licensed fintech in three months.",
    quote:
      "We could not have built this company without Supabase. If I had to go and build all these components myself, we wouldn't even have launched.",
    author: "Thiago Peres, Founder & CTO, Rally",
    tone: "brand" as const,
  },
  {
    id: "hyper",
    name: "Hyper",
    tagline: "An AI-native marketing platform with agents that operate across the entire workflow.",
    quote:
      "I will get on a podcast and talk about how much I love Supabase. With Supabase we can move fast and build things that delight our customers.",
    author: "Elliot Fleck, Co-founder, Hyper",
    tone: "foreground" as const,
  },
] as const;

export const COMMUNITY_QUOTES = [
  {
    handle: "@kiwicopple",
    name: "Copple",
    body: "Postgres is the default database for AI builders. Auth, Storage, and Vectors in the same place.",
  },
  {
    handle: "@tdinh_me",
    name: "Tony Dinh",
    body: "Shipped a weekend project that is now handling production traffic. The dashboard is the whole backend.",
  },
  {
    handle: "@chantastic",
    name: "chantastic",
    body: "Row Level Security finally clicked when I could write the policy next to the table.",
  },
  {
    handle: "@rauchg",
    name: "Guillermo Rauch",
    body: "The Postgres development platform that actually feels like a product.",
  },
  {
    handle: "@steventey",
    name: "Steven Tey",
    body: "Auth, Storage, Realtime, Vectors. One project. One dashboard.",
  },
  {
    handle: "@shadcn",
    name: "shadcn",
    body: "I can start a project on Friday and have users on Monday. That is the whole pitch.",
  },
] as const;

export const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: ["Database", "Auth", "Functions", "Realtime", "Storage", "Vector", "Pricing"],
  },
  {
    title: "Resources",
    links: ["Blog", "Support", "Careers", "Open Source", "Changelog", "Events"],
  },
  {
    title: "Developers",
    links: ["Documentation", "API Reference", "Guides", "Integrations"],
  },
  {
    title: "Company",
    links: ["About", "Terms", "Privacy", "Brand assets"],
  },
] as const;

export const GITHUB_STAR_LABEL = "92.4k";
