/**
 * Help content for the searchable help page.
 *
 * !! IMPORTANT !!
 * When adding a new feature to the app, add a corresponding help entry here.
 * Each entry should describe what the feature does, who can access it,
 * and step-by-step instructions.
 */

export interface HelpEntry {
  id: string;
  title: string;
  category: string;
  keywords: string[];
  content: string;
}

export const HELP_CATEGORIES = [
  'Getting Started',
  'Features',
  'Schedule',
  'Daily Lineup',
  'Pairings',
  'Administration',
  'Settings',
] as const;

export const HELP_ENTRIES: HelpEntry[] = [
  // ── Getting Started ───────────────────────────────────────
  {
    id: 'login',
    title: 'Logging In',
    category: 'Getting Started',
    keywords: ['login', 'sign in', 'password', 'email', 'authentication'],
    content:
      'Navigate to the login page and enter your email and password. After a successful login you will be redirected to the Dashboard. Your session token is stored locally so you stay signed in until you explicitly sign out.',
  },
  {
    id: 'roles',
    title: 'User Roles & Permissions',
    category: 'Getting Started',
    keywords: ['role', 'permission', 'server', 'chef', 'manager', 'admin', 'access'],
    content:
      'FeatureBoard has four roles:\n\n• **Server** — View the daily lineup only.\n• **Chef** — Create and edit feature items, manage the schedule.\n• **Manager** — Approve/publish features, edit pricing, view reports, manage users.\n• **Admin** — Full access including user management, categories, and system configuration.',
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    category: 'Getting Started',
    keywords: ['dashboard', 'home', 'overview', 'navigation'],
    content:
      'The Dashboard is your landing page after login. It shows quick-access cards to the sections you have permission to use. Click any card to navigate to that section.',
  },

  // ── Features ──────────────────────────────────────────────
  {
    id: 'feature-library',
    title: 'Feature Item Library',
    category: 'Features',
    keywords: ['feature', 'item', 'library', 'create', 'edit', 'delete', 'menu'],
    content:
      'The Features page is your reusable menu-item library. Each feature item has a name, category, description, ingredients, allergens, cost, price, and tags. Items created here can be scheduled onto any date.',
  },
  {
    id: 'create-feature',
    title: 'Creating a Feature Item',
    category: 'Features',
    keywords: ['create', 'add', 'new', 'feature', 'item', 'form'],
    content:
      'Click **New Feature Item** on the Features page. Fill in the name, select a category, add a description, ingredients, allergens, and set the cost/price. The margin percentage is calculated automatically. Click **Save** to add the item to your library.',
  },
  {
    id: 'margin-calculation',
    title: 'Margin Calculation',
    category: 'Features',
    keywords: ['margin', 'cost', 'price', 'profit', 'percentage'],
    content:
      'Margin is calculated as **(price − cost) / price × 100**. It is displayed automatically whenever you enter cost and price values. Use this to ensure your features meet profitability targets.',
  },
  {
    id: 'feature-filters',
    title: 'Sorting & Filtering Features',
    category: 'Features',
    keywords: ['sort', 'filter', 'search', 'category', 'tag'],
    content:
      'Use the filter controls at the top of the Features page to narrow by category or search by name. Click column headers to sort. These filters help you quickly find items in a large library.',
  },

  // ── Schedule ──────────────────────────────────────────────
  {
    id: 'weekly-schedule',
    title: 'Weekly Schedule',
    category: 'Schedule',
    keywords: ['schedule', 'week', 'calendar', 'plan', 'date'],
    content:
      'The Schedule page displays a weekly grid. Each day and meal period (lunch/dinner) shows the features assigned. Use the arrows to navigate between weeks.',
  },
  {
    id: 'schedule-feature',
    title: 'Adding a Feature to the Schedule',
    category: 'Schedule',
    keywords: ['schedule', 'add', 'assign', 'drag', 'drop', 'meal', 'lunch', 'dinner'],
    content:
      'Click **Add Feature** on any day/meal-period cell, then select a feature item from your library. You can also drag and drop items to rearrange their order or move them between days.',
  },
  {
    id: 'duplicate-week',
    title: 'Duplicating a Week',
    category: 'Schedule',
    keywords: ['duplicate', 'copy', 'week', 'clone', 'repeat'],
    content:
      'Click **Duplicate Week** to copy the entire current week\'s schedule into the following week. This is useful when many features repeat weekly — just tweak the copy instead of starting from scratch.',
  },
  {
    id: 'feature-status',
    title: 'Feature Status (Draft / Published / 86\'d)',
    category: 'Schedule',
    keywords: ['status', 'draft', 'published', 'publish', '86', 'eighty-six', 'sold out'],
    content:
      'Scheduled features have three statuses:\n\n• **Draft** — Not yet visible on the daily lineup.\n• **Published** — Visible to servers on the Today page.\n• **86\'d** — Marked as sold out / unavailable.\n\nClick the status badge to cycle through states. Only Managers and above can publish.',
  },

  // ── Daily Lineup ──────────────────────────────────────────
  {
    id: 'today-lineup',
    title: 'Today\'s Features (Daily Lineup)',
    category: 'Daily Lineup',
    keywords: ['today', 'lineup', 'daily', 'server', 'mobile', 'view'],
    content:
      'The Today page shows all published features for the current date, grouped by meal period. This is the mobile-first, read-only view designed for servers to review before their shift.',
  },
  {
    id: 'print-lineup',
    title: 'Printing the Lineup',
    category: 'Daily Lineup',
    keywords: ['print', 'pdf', 'export', 'paper', 'lineup', 'sheet'],
    content:
      'Click **Print Lineup** on the Today page to open a print-friendly version. Use your browser\'s print dialog (Ctrl+P / Cmd+P) to print or save as PDF. The printout includes wine pairings and allergen information.',
  },

  // ── Pairings ──────────────────────────────────────────────
  {
    id: 'wine-pairings',
    title: 'Wine Pairings',
    category: 'Pairings',
    keywords: ['wine', 'pairing', 'pair', 'beverage', 'food', 'suggestion'],
    content:
      'The Pairings page lets you link food feature items with wine items and add tasting notes. These pairings appear on the daily lineup and print sheets so servers can make informed recommendations.',
  },
  {
    id: 'create-pairing',
    title: 'Creating a Pairing',
    category: 'Pairings',
    keywords: ['create', 'add', 'pairing', 'wine', 'food', 'note'],
    content:
      'Click **New Pairing** and select a food item and a wine item from the dropdowns. Add a pairing note describing why they complement each other. Click **Save** to create the pairing.',
  },

  // ── Administration ────────────────────────────────────────
  {
    id: 'manage-users',
    title: 'Managing Users',
    category: 'Administration',
    keywords: ['user', 'manage', 'create', 'edit', 'deactivate', 'delete', 'admin'],
    content:
      'Navigate to **Users** in the sidebar (Manager+ role required). You can create new users, edit their name/email/role, deactivate accounts, or delete them. Each user must have a unique email and one of the four roles.',
  },
  {
    id: 'manage-categories',
    title: 'Managing Categories',
    category: 'Administration',
    keywords: ['category', 'categories', 'add', 'edit', 'delete', 'reorder', 'admin'],
    content:
      'Navigate to **Categories** in the sidebar (Admin only). Default categories include Appetizer, Soup, Fish, Entrée, Dessert, and Wine. You can add custom categories, rename existing ones, reorder them, or delete unused ones.',
  },

  // ── Settings ──────────────────────────────────────────────
  {
    id: 'themes',
    title: 'Changing the Theme',
    category: 'Settings',
    keywords: ['theme', 'color', 'dark', 'light', 'appearance', 'classic', 'bistro', 'ocean', 'vineyard', 'wolfpack', 'tarheels', 'blue devils'],
    content:
      'Use the theme dropdown in the top-right header bar to switch between visual themes. Available themes: Classic, Bistro, Ocean, Vineyard, Wolfpack (NC State), Tarheels (UNC), and Blue Devils (Duke). Your choice is saved locally and persists across sessions.',
  },
];
