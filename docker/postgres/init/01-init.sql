-- Initialize the database with extensions and basic configuration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create a custom function for generating cuid-like IDs
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS text AS $$
DECLARE
    timestamp_part text;
    counter_part text;
    random_part text;
BEGIN
    -- Get current timestamp in base36
    timestamp_part := to_base(extract(epoch from now())::bigint, 36);
    
    -- Generate a random part (8 characters)
    random_part := lower(to_base(floor(random() * 36^8)::bigint, 36));
    
    -- Simple counter simulation (in real implementation, this would be more sophisticated)
    counter_part := to_base(floor(random() * 36^4)::bigint, 36);
    
    RETURN 'c' || lpad(timestamp_part, 8, '0') || lpad(counter_part, 4, '0') || random_part;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE election_commission TO postgres;
