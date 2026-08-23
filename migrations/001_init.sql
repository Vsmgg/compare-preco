-- Compare Preço — schema inicial

CREATE TABLE IF NOT EXISTS searches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query           TEXT NOT NULL,
  normalized_query TEXT,
  category        TEXT,
  weights         JSONB,
  status          TEXT NOT NULL DEFAULT 'pending',
  sources_used    INTEGER,
  offers_found    INTEGER,
  search_duration_ms INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  brand       TEXT,
  model       TEXT,
  category    TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
  store           TEXT NOT NULL,
  title           TEXT NOT NULL,
  price           NUMERIC(12,2),
  original_price  NUMERIC(12,2),
  currency        TEXT DEFAULT 'BRL',
  image_url       TEXT,
  product_url     TEXT NOT NULL,
  rating          NUMERIC(3,2),
  review_count    INTEGER,
  shipping_price  NUMERIC(12,2),
  shipping_date   TEXT,
  availability    BOOLEAN,
  condition       TEXT,
  seller          TEXT,
  source          TEXT NOT NULL DEFAULT 'brave_search',
  last_checked    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offers_product_id ON offers(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_product_url ON offers(product_url);

CREATE TABLE IF NOT EXISTS search_results (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id   UUID NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
  offer_id    UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  score       NUMERIC(5,2) NOT NULL,
  rank        INTEGER NOT NULL,
  badge       TEXT,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_results_search_id ON search_results(search_id);

CREATE TABLE IF NOT EXISTS price_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id    UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  price       NUMERIC(12,2) NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_history_offer_id ON price_history(offer_id);

CREATE TABLE IF NOT EXISTS clicks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id   UUID REFERENCES searches(id) ON DELETE SET NULL,
  offer_id    UUID REFERENCES offers(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clicks_offer_id ON clicks(offer_id);
