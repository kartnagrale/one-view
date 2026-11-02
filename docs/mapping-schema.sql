-- Optional DBA-run script when the application account is not allowed to CREATE SCHEMA/TABLE.
CREATE SCHEMA IF NOT EXISTS agri_analytix;
CREATE TABLE IF NOT EXISTS agri_analytix.market_mapping (
  id BIGSERIAL PRIMARY KEY,
  source VARCHAR(20) NOT NULL,
  global_client VARCHAR(120) NOT NULL,
  market_code VARCHAR(80) NOT NULL,
  commodity_code VARCHAR(120),
  commodity_display_name VARCHAR(180),
  contract_code VARCHAR(160),
  state_name VARCHAR(120),
  location_name VARCHAR(180),
  warehouse VARCHAR(180),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  notes VARCHAR(500),
  updated_by VARCHAR(120) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agri_mapping_lookup
  ON agri_analytix.market_mapping(source, market_code, commodity_code, contract_code, active);
