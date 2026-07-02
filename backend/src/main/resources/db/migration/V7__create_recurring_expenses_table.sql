CREATE TABLE recurring_expenses (
    id              UUID PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    category_id     UUID NOT NULL REFERENCES expense_categories (id) ON DELETE RESTRICT,
    description     VARCHAR(255) NOT NULL,
    value           NUMERIC(12, 2) NOT NULL,
    simulated_value NUMERIC(12, 2),
    active          BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_recurring_expenses_value_positive CHECK (value >= 0),
    CONSTRAINT chk_recurring_expenses_simulated_positive CHECK (simulated_value IS NULL OR simulated_value >= 0)
);

CREATE INDEX idx_recurring_expenses_user_id ON recurring_expenses (user_id);
