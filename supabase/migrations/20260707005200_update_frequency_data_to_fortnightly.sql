-- 1. Explicitly drop the old constraints
ALTER TABLE pay_schedules DROP CONSTRAINT IF EXISTS pay_schedules_frequency_check;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_frequency_check;
ALTER TABLE household_contributions DROP CONSTRAINT IF EXISTS household_contributions_frequency_check;

-- 2. Update all variations of by-weekly to fortnightly
UPDATE pay_schedules SET frequency = 'fortnightly' WHERE lower(frequency) IN ('by-weekly', 'bi-weekly', 'biweekly');
UPDATE bills SET frequency = 'fortnightly' WHERE lower(frequency) IN ('by-weekly', 'bi-weekly', 'biweekly');
UPDATE household_contributions SET frequency = 'fortnightly' WHERE lower(frequency) IN ('by-weekly', 'bi-weekly', 'biweekly');

-- 3. Add the final constraints
ALTER TABLE pay_schedules ADD CONSTRAINT pay_schedules_frequency_check CHECK (frequency IN ('weekly', 'fortnightly', 'monthly', 'yearly'));
ALTER TABLE bills ADD CONSTRAINT bills_frequency_check CHECK (frequency IN ('weekly', 'fortnightly', 'monthly', 'yearly'));
ALTER TABLE household_contributions ADD CONSTRAINT household_contributions_frequency_check CHECK (frequency IN ('weekly', 'fortnightly', 'monthly', 'yearly'));
