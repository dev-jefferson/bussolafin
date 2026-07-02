export type User = {
  id: string;
  name: string;
  email: string;
};

export type Category = {
  id: string;
  name: string;
  adjustable: boolean;
};

export type Budget = {
  id: string;
  month: number;
  year: number;
  previousBalance: number;
};

export type Income = {
  id: string;
  description: string;
  day: number | null;
  value: number;
  recurring: boolean;
};

export type Expense = {
  id: string;
  description: string;
  category: Category;
  value: number;
  simulatedValue: number | null;
  recurring: boolean;
};

export type RecurringExpense = {
  id: string;
  description: string;
  category: Category;
  value: number;
  simulatedValue: number | null;
  active: boolean;
};

export type RecurringIncome = {
  id: string;
  description: string;
  day: number | null;
  value: number;
  active: boolean;
};

export type GenerateRecurringResult = {
  expensesAdded: number;
  incomesAdded: number;
};

export type BudgetSummary = {
  budgetId: string;
  month: number;
  year: number;
  previousBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalExpensesSimulated: number;
  totalAdjustable: number;
  totalAdjustableSimulated: number;
  economia: number;
  economiaSimulada: number;
};

export type CategoryBreakdownItem = {
  categoryId: string;
  categoryName: string;
  adjustable: boolean;
  total: number;
  totalSimulated: number;
};

export type MonthComparisonItem = {
  budgetId: string;
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  totalExpensesSimulated: number;
  economia: number;
  economiaSimulada: number;
};

export type ApiError = {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: Record<string, string>;
};
