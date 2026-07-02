CREATE TABLE expenses (
    id              UUID PRIMARY KEY,
    budget_id       UUID NOT NULL REFERENCES budgets (id) ON DELETE CASCADE,
    category_id     UUID NOT NULL REFERENCES expense_categories (id) ON DELETE RESTRICT,
    value           NUMERIC(12, 2) NOT NULL,
    simulated_value NUMERIC(12, 2),
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_expenses_value_positive CHECK (value >= 0),
    CONSTRAINT chk_expenses_simulated_positive CHECK (simulated_value IS NULL OR simulated_value >= 0)
);

CREATE INDEX idx_expenses_budget_id ON expenses (budget_id);
CREATE INDEX idx_expenses_category_id ON expenses (category_id);
