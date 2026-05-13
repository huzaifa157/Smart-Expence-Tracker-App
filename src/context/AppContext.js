// AppContext.js
// Global state management for SpendWise using React Context + useReducer.
// All screens read state and fire dispatch() from this single source of truth.

import React, {createContext, useContext, useReducer, useEffect} from 'react';
// AsyncStorage — persists state across app restarts on the device (not a server)
import AsyncStorage from '@react-native-async-storage/async-storage';
// Seed data shown to demo/returning users so the app looks populated on first login
import {MOCK_EXPENSES, MOCK_GOALS} from '../data/mockData';

// ─── Context object ───────────────────────────────────────────────────────────
// createContext() returns an object with a Provider component and a Consumer.
// Any component inside <AppProvider> can call useApp() to access state & dispatch.
const AppContext = createContext();

// ─── Zero budgets — for brand new users ──────────────────────────────────────
// Defined as a MODULE-LEVEL constant (outside any function/component).
// This makes it completely immune to whatever values are stored in state.budgets.
// New users MUST start with 0 in every budget category — no hardcoded defaults.
const ZERO_BUDGETS = {
  monthly:       0,  // Overall monthly spending limit
  food:          0,  // Food & Dining limit
  transport:     0,  // Transport limit
  entertainment: 0,  // Entertainment limit
  shopping:      0,  // Shopping limit
  health:        0,  // Health limit
  education:     0,  // Education limit
  utilities:     0,  // Utilities limit
  savings:       0,  // Savings target limit
  other:         0,  // Miscellaneous limit
};

// ─── Demo budgets — for demo / returning users ────────────────────────────────
// Realistic values that make the app look meaningful when signed in as demo.
// Used when isNew === false (existing accounts, demo login, social auth returning).
const DEMO_BUDGETS = {
  monthly:       120000, // ₨ 120,000 total monthly cap for demo
  food:          40000,  // ₨ 40,000 food & dining for demo
  transport:     25000,  // ₨ 25,000 transport for demo
  entertainment: 15000,  // ₨ 15,000 entertainment for demo
  shopping:      10000,  // ₨ 10,000 shopping for demo
  health:        5000,   // ₨ 5,000 health for demo
  education:     5000,   // ₨ 5,000 education for demo
  utilities:     8000,   // ₨ 8,000 utilities for demo
  savings:       12000,  // ₨ 12,000 savings target for demo
  other:         15000,  // ₨ 15,000 other for demo
};

// ─── Initial state ────────────────────────────────────────────────────────────
// The default shape of the app state on a fresh install (no AsyncStorage data).
// Every key here can be overridden by loading from AsyncStorage on app start.
const initialState = {
  isNewUser:  true,    // True = user hasn't completed onboarding yet
  user:       null,    // Logged-in user object {name, email, pass}, or null if signed out

  isDarkMode: true,    // Global dark/light theme flag; true = dark mode

  // Default currency — PKR (Pakistani Rupee). All other currencies convert from PKR.
  currency: {code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', flag: '🇵🇰', rate: 1},

  expenses: [],        // All expense and income records [{id, desc, amount, cat, date, ...}]
  goals:    [],        // All savings goals [{id, name, target, saved, emoji, ...}]

  // budgets MUST be ZERO_BUDGETS here — never hardcode real values.
  // Hardcoded defaults (e.g. monthly: 120000) caused new users to see fake budgets.
  budgets:  ZERO_BUDGETS,

  streak:   0,         // Number of consecutive days a transaction was logged
  points:   0,         // Total gamification XP points earned
  level:    1,         // Current gamification level (mapped from points)
  badges:   [],        // IDs of all earned achievement badges

  registeredUsers: [], // Local "database" of every account registered on this device
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
// A pure function: (currentState, action) → newState.
// NEVER mutates state directly — always spreads into a new object.
function reducer(state, action) {
  switch (action.type) {

    // ── LOAD_STATE ────────────────────────────────────────────────────────────
    // Fired once on app startup. Merges the parsed AsyncStorage JSON over the
    // in-memory defaults so the user resumes exactly where they left off.
    case 'LOAD_STATE':
      return {...state, ...action.payload}; // action.payload = parsed AsyncStorage object

    // ── REGISTER_USER ─────────────────────────────────────────────────────────
    // Appends a newly registered user to the device-local user list.
    // Must be dispatched BEFORE LOGIN so the account can be found on sign-in.
    case 'REGISTER_USER':
      return {
        ...state,                                               // Keep all existing state
        registeredUsers: [...state.registeredUsers, action.user], // Append new user object
      };

    // ── LOGIN ─────────────────────────────────────────────────────────────────
    // Sets the active session. Behaviour differs based on action.isNew:
    //   isNew: true  → brand-new account. Everything starts zeroed / empty.
    //   isNew: false → demo or returning user. Gets seed data + DEMO_BUDGETS.
    case 'LOGIN':
      return {
        ...state,             // Preserve theme, currency, registeredUsers, etc.
        user:      action.user,    // Set the currently logged-in user
        isNewUser: action.isNew,   // Save new-user flag in state (also persisted)

        // Expenses: empty array for new users; mock data for demo/returning
        expenses: action.isNew ? [] : MOCK_EXPENSES,

        // Goals: empty array for new users; mock goals for demo/returning
        goals: action.isNew ? [] : MOCK_GOALS,

        // Budgets: ZERO for new users (they set their own in ProfileScreen)
        //          DEMO for returning/demo users (realistic looking data)
        budgets: action.isNew ? ZERO_BUDGETS : DEMO_BUDGETS,

        // Gamification stats: zeroed for new users, pre-seeded for demo
        streak: action.isNew ? 0  : 14,
        points: action.isNew ? 0  : 2840,
        level:  action.isNew ? 1  : 5,

        // Badges: empty for new; curated set for demo to show off the system
        badges: action.isNew ? [] : ['first_expense','seven_day','budget_pro','saver','goal_setter'],
      };

    // ── LOGOUT ────────────────────────────────────────────────────────────────
    // Resets the app back to a clean logged-out state.
    // Intentionally keeps registeredUsers (so accounts still exist) and
    // isDarkMode (so the user's theme preference survives the logout).
    case 'LOGOUT':
      return {
        ...initialState,                        // Wipe all user-specific data
        registeredUsers: state.registeredUsers, // Preserve local account list
        isDarkMode:      state.isDarkMode,      // Preserve theme preference
      };

    // ── SET_THEME ─────────────────────────────────────────────────────────────
    // Toggles dark mode. action.val is a boolean (true = dark, false = light).
    case 'SET_THEME':
      return {...state, isDarkMode: action.val};

    // ── SET_CURRENCY ──────────────────────────────────────────────────────────
    // Replaces the active currency with a new one.
    // action.currency = {code, symbol, name, flag, rate} object.
    case 'SET_CURRENCY':
      return {...state, currency: action.currency};

    // ── ADD_EXPENSE ───────────────────────────────────────────────────────────
    // Appends a new expense or income transaction to the list.
    // Awards 10 XP and may unlock achievement badges.
    case 'ADD_EXPENSE': {
      const newExp    = [...state.expenses, action.expense]; // New list with appended transaction
      const newPoints = state.points + 10;                   // Award +10 XP for logging
      let   newBadges = [...state.badges];                   // Copy existing badges

      // 'first_expense' badge — granted on the very first transaction ever logged
      if (!newBadges.includes('first_expense')) newBadges.push('first_expense');

      // 'hundred_tx' badge — granted when the user logs their 100th transaction
      if (newExp.length >= 100 && !newBadges.includes('hundred_tx')) newBadges.push('hundred_tx');

      return {...state, expenses: newExp, points: newPoints, badges: newBadges};
    }

    // ── UPDATE_EXPENSE ────────────────────────────────────────────────────────
    // Replaces a specific expense in the list, matched by its unique id.
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        // Map over expenses: swap the matching one, leave others untouched
        expenses: state.expenses.map(e => e.id === action.expense.id ? action.expense : e),
      };

    // ── DELETE_EXPENSE ────────────────────────────────────────────────────────
    // Removes a specific expense from the list by id.
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.id), // Remove matched id
      };

    // ── ADD_GOAL ──────────────────────────────────────────────────────────────
    // Appends a new savings goal. Awards 50 XP and 'goal_setter' badge (first time).
    case 'ADD_GOAL': {
      const newBadges = [...state.badges];                                  // Copy badges
      if (!newBadges.includes('goal_setter')) newBadges.push('goal_setter'); // First goal badge
      return {
        ...state,
        goals:  [...state.goals, action.goal], // Append new goal to list
        points: state.points + 50,             // Award +50 XP for setting a goal
        badges: newBadges,
      };
    }

    // ── UPDATE_GOAL ───────────────────────────────────────────────────────────
    // Replaces an existing goal in the list, matched by id.
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.goal.id ? action.goal : g),
      };

    // ── DELETE_GOAL ───────────────────────────────────────────────────────────
    // Removes a goal from the list by id.
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(g => g.id !== action.id),
      };

    // ── TRANSFER_TO_GOAL ──────────────────────────────────────────────────────
    // Moves money from the wallet balance into a goal's saved amount.
    // Records the transfer as an expense entry so the dashboard balance updates.
    case 'TRANSFER_TO_GOAL': {
      // Increment the 'saved' amount of the target goal only
      const updatedGoals = state.goals.map(g =>
        g.id === action.goalId
          ? {...g, saved: g.saved + action.amount} // Increase savings
          : g                                       // Leave other goals unchanged
      );

      // Build a synthetic expense to represent the transfer in transaction history
      const transferExp = {
        id:     Date.now().toString(),            // Unique timestamp-based ID
        desc:   `Transfer → ${action.goalName}`,  // Shown in the transaction list
        amount: action.amount,                    // Amount moved (PKR base)
        cat:    'Savings',                        // Category label for filtering
        emoji:  '🎯',                             // Icon shown in the list
        date:   new Date().toISOString(),         // Current ISO timestamp
      };

      return {
        ...state,
        goals:    updatedGoals,                     // Goals with updated saved amount
        expenses: [transferExp, ...state.expenses], // Prepend transfer to history
        points:   state.points + 25,                // Award +25 XP for saving
      };
    }

    // ── SET_BUDGET ────────────────────────────────────────────────────────────
    // Saves the user's custom budget limits per category.
    // Merges with ZERO_BUDGETS (not state.budgets!) to ensure:
    //   - All 10 keys always exist (handles older saves that are missing new keys)
    //   - Old hardcoded defaults can NEVER leak in via state.budgets
    case 'SET_BUDGET':
      return {
        ...state,
        budgets: {...ZERO_BUDGETS, ...action.budgets}, // Start from zeros, overlay new values
      };

    // ── EARN_POINTS ───────────────────────────────────────────────────────────
    // Generic XP award. action.pts is the number of points to add.
    case 'EARN_POINTS':
      return {...state, points: state.points + action.pts};

    // ── EARN_BADGE ────────────────────────────────────────────────────────────
    // Awards a named badge and its XP bonus.
    // Guard clause prevents the same badge from being awarded twice.
    case 'EARN_BADGE':
      if (state.badges.includes(action.badge)) return state; // Already earned — no-op
      return {
        ...state,
        badges: [...state.badges, action.badge], // Append badge ID to list
        points: state.points + action.pts,        // Award badge's XP bonus
      };

    // ── COMPLETE_ONBOARDING ───────────────────────────────────────────────────
    // Fired by OnboardingScreen's final "Get Started" button.
    // Marks the user as no longer new so the onboarding flow never shows again.
    case 'COMPLETE_ONBOARDING':
      return {...state, isNewUser: false};

    // Default — unknown action types return state unchanged (safe no-op)
    default:
      return state;
  }
}

// ─── AppProvider component ────────────────────────────────────────────────────
// Wrap the entire app tree in this component (inside App.js / index.js).
// It provides {state, dispatch} to every descendant via React Context.
export function AppProvider({children}) {
  // useReducer manages the state machine. Returns [state, dispatch].
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Effect 1: Load persisted state from device storage (runs ONCE on mount) ─
  // When the app launches, reads previously saved JSON from AsyncStorage and
  // dispatches LOAD_STATE to merge it over the in-memory initial defaults.
  useEffect(() => {
    (async () => {
      try {
        // Attempt to read the saved state blob from device storage
        const saved = await AsyncStorage.getItem('spendwise_state');

        if (saved) {
          // Parse the JSON string into a plain JavaScript object
          const parsed = JSON.parse(saved);

          // Budget key migration: ensure all 10 category keys exist even in
          // old saves that were created before new categories were added.
          // ZERO_BUDGETS provides the missing keys; the saved values override them.
          if (parsed.budgets) {
            parsed.budgets = {...ZERO_BUDGETS, ...parsed.budgets};
          }

          // Merge the parsed data into current state
          dispatch({type: 'LOAD_STATE', payload: parsed});
        }
      } catch (_) {
        // Silently ignore read errors (fresh install, corrupted data, etc.)
        // The app continues with initialState — no crash.
      }
    })(); // IIFE so we can use await inside this synchronous useEffect
  }, []); // Empty deps → only runs once when the provider mounts

  // ── Effect 2: Persist state to device storage (runs on every state change) ──
  // Serialises key parts of state to JSON and writes to AsyncStorage.
  // Only writes when a user is logged in (no point saving anonymous state).
  useEffect(() => {
    if (state.user) {
      // Write selected state keys to AsyncStorage as a JSON string.
      // We only persist what's needed to restore a session — not UI animation state, etc.
      AsyncStorage.setItem('spendwise_state', JSON.stringify({
        user:            state.user,            // Logged-in user identity
        isDarkMode:      state.isDarkMode,      // Dark/light mode preference
        currency:        state.currency,        // Active currency (code, symbol, rate)
        expenses:        state.expenses,        // Full transaction history
        goals:           state.goals,           // All savings goals
        budgets:         state.budgets,         // Custom budget limits per category
        streak:          state.streak,          // Daily logging streak count
        points:          state.points,          // Gamification XP total
        level:           state.level,           // Gamification level
        badges:          state.badges,          // Earned badge IDs
        registeredUsers: state.registeredUsers, // Local user account database
        isNewUser:       state.isNewUser,       // New-user flag (needed across restarts)
      })).catch(() => {}); // Silently ignore write failures (e.g. full storage)
    }
  }, [state]); // Dependency on state → fires whenever anything changes

  // Render the context provider, passing value = {state, dispatch} to all children
  return (
    <AppContext.Provider value={{state, dispatch}}>
      {children}
    </AppContext.Provider>
  );
}

// ─── useApp hook ──────────────────────────────────────────────────────────────
// Convenience hook so any component can get state and dispatch in one line:
//   const { state, dispatch } = useApp();
// Without this, components would need to write:
//   const { state, dispatch } = useContext(AppContext);
export const useApp = () => useContext(AppContext);