ALTER TABLE expenses ADD COLUMN adjustable BOOLEAN NOT NULL DEFAULT false;
UPDATE expenses e SET adjustable = ec.adjustable FROM expense_categories ec WHERE e.category_id = ec.id;

ALTER TABLE recurring_expenses ADD COLUMN adjustable BOOLEAN NOT NULL DEFAULT false;
UPDATE recurring_expenses re SET adjustable = ec.adjustable FROM expense_categories ec WHERE re.category_id = ec.id;

ALTER TABLE expense_categories DROP COLUMN adjustable;
