CREATE TABLE expense_entries (
    id UUID PRIMARY KEY,
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    day INTEGER,
    value NUMERIC(12, 2) NOT NULL,
    paid BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_expense_entries_day CHECK (day IS NULL OR day BETWEEN 1 AND 31),
    CONSTRAINT chk_expense_entries_value_positive CHECK (value >= 0)
);

CREATE INDEX idx_expense_entries_expense_id ON expense_entries(expense_id);
