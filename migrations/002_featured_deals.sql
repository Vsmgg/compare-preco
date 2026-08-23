-- Compare Preço — destaques verificados (persistidos para nao depender de
-- uma busca ao vivo dentro do limite de tempo de uma requisicao).

CREATE TABLE IF NOT EXISTS featured_deals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  store             TEXT NOT NULL,
  price             NUMERIC(12,2) NOT NULL,
  original_price    NUMERIC(12,2) NOT NULL,
  discount_percent  INTEGER NOT NULL,
  currency          TEXT DEFAULT 'BRL',
  image_url         TEXT,
  product_url       TEXT NOT NULL UNIQUE,
  rating            NUMERIC(3,2),
  review_count      INTEGER,
  availability      BOOLEAN,
  condition         TEXT,
  seller            TEXT,
  verified_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_featured_deals_verified_at ON featured_deals(verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_featured_deals_discount ON featured_deals(discount_percent DESC);

-- Single-row table holding the latest AI-written summary paragraph shown
-- above the deals grid.
CREATE TABLE IF NOT EXISTS deals_meta (
  id          TEXT PRIMARY KEY DEFAULT 'latest',
  intro       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
