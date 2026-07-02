CREATE TABLE recurring_incomes (
    id          UUID PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    day         INTEGER,
    value       NUMERIC(12, 2) NOT NULL,
    active      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_recurring_incomes_day CHECK (day IS NULL OR day BETWEEN 1 AND 31)
);

CREATE INDEX idx_recurring_incomes_user_id ON recurring_incomes (user_id);
