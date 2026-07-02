CREATE TABLE expense_categories (
    id         UUID PRIMARY KEY,
    user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name       VARCHAR(255) NOT NULL,
    adjustable BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_expense_categories_user_name UNIQUE (user_id, name)
);

CREATE INDEX idx_expense_categories_user_id ON expense_categories (user_id);
