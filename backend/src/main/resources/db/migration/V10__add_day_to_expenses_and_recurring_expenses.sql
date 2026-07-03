ALTER TABLE expenses ADD COLUMN day INTEGER;
ALTER TABLE expenses ADD CONSTRAINT chk_expenses_day CHECK (day IS NULL OR day BETWEEN 1 AND 31);

ALTER TABLE recurring_expenses ADD COLUMN day INTEGER;
ALTER TABLE recurring_expenses ADD CONSTRAINT chk_recurring_expenses_day CHECK (day IS NULL OR day BETWEEN 1 AND 31);
