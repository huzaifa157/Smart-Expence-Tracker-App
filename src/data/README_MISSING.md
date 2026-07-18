# Missing file: mockData.js

This project's screens import named values from `../data/mockData`:

- `MOCK_EXPENSES`, `MOCK_GOALS`           (used in src/context/AppContext.js)
- `EXPENSE_CATEGORIES`, `GAMIFICATION_LEVELS`, `GOAL_ICONS`  (used in Dashboard/Analytics/Goals/Transactions screens)
- `CURRENCIES`, `FAQ_DATA`                (used in ProfileScreen.js)

This file was never uploaded, so it isn't included here. Drop your real
`mockData.js` into this folder (src/data/mockData.js) before running the app —
without it, every screen that imports from '../data/mockData' will fail to
resolve the module.
