-- Issue #60: migrate goal (funds) and bill categories to the new 8-category scheme.
-- Idempotent: every WHERE matches only OLD values, so re-running is a no-op.
-- 'Education' and 'Other' already match the new names and need no update.

-- Goals (funds.category)
UPDATE funds SET category = 'Emergency'         WHERE category = 'Emergency Fund';
UPDATE funds SET category = 'Home & Living'     WHERE category = 'Buy a House';
UPDATE funds SET category = 'Vacation & Travel' WHERE category IN ('Vacation', 'Transport');
UPDATE funds SET category = 'Debt & Finance'    WHERE category IN ('Debt Payoff', 'Interest Free Payment');

-- Bills (bills.category)
UPDATE bills SET category = 'Debt & Finance'    WHERE category = 'Debt/Finance';
