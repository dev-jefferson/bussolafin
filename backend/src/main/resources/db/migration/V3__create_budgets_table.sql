CREATE TABLE budgets (
    id               UUID PRIMARY KEY,
    user_id          UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    month            INTEGER NOT NULL,
    year             INTEGER NOT NULL,
    previous_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at       TIMESTAMP NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP,
    CONSTRAINT uq_budgets_user_month_year UNIQUE (user_id, month, year),
    CONSTRAINT chk_budgets_month CHECK (month BETWEEN 1 AND 12)
);

CREATE INDEX idx_budgets_user_id ON budgets (user_id);
