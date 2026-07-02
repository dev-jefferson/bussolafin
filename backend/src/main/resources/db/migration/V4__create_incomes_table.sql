CREATE TABLE incomes (
    id          UUID PRIMARY KEY,
    budget_id   UUID NOT NULL REFERENCES budgets (id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    day         INTEGER,
    value       NUMERIC(12, 2) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_incomes_day CHECK (day IS NULL OR day BETWEEN 1 AND 31)
);

CREATE INDEX idx_incomes_budget_id ON incomes (budget_id);
