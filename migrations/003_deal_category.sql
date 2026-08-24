-- Compare Preço — adiciona categoria aos destaques para agrupar a
-- vitrine por genero/tipo de produto.

ALTER TABLE featured_deals ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Outros';

CREATE INDEX IF NOT EXISTS idx_featured_deals_category ON featured_deals(category);
