INSERT INTO customers (public_id, full_name, email, phone, status)
VALUES
    ('CUS-1001', 'Amina Khan', 'amina.khan@example.com', '555-0101', 'ACTIVE'),
    ('CUS-1002', 'Ravi Singh', 'ravi.singh@example.com', '555-0102', 'PROSPECT')
ON CONFLICT (public_id) DO UPDATE
SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    status = EXCLUDED.status;
