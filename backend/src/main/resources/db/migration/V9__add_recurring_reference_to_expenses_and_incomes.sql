ALTER TABLE expenses
    ADD COLUMN recurring_expense_id UUID REFERENCES recurring_expenses (id) ON DELETE SET NULL;

ALTER TABLE incomes
    ADD COLUMN recurring_income_id UUID REFERENCES recurring_incomes (id) ON DELETE SET NULL;

CREATE INDEX idx_expenses_recurring_expense_id ON expenses (recurring_expense_id);
CREATE INDEX idx_incomes_recurring_income_id ON incomes (recurring_income_id);
