# Compare Preço

Comparador de preços com IA. O usuário pesquisa um produto, a IA interpreta a intenção, o sistema busca ofertas reais na web (Brave Search), normaliza e rankeia por preço, avaliação, confiabilidade e entrega, e a IA (Gemini) explica a recomendação. Nenhum dado é inventado — quando algo não é encontrado, o site mostra "Não informado".

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Neon Postgres · Gemini · Brave Search API

## Setup local

```bash
npm install
cp .env.example .env.local   # preencha com suas credenciais
node scripts/migrate.mjs      # cria as tabelas no Postgres (usa DATABASE_URL_UNPOOLED)
npm run dev
```

## Variáveis de ambiente

Veja `.env.example`. Todas são usadas apenas no servidor (nunca expostas ao navegador):

- `DATABASE_URL` — conexão pooled com o Postgres (Neon), usada em runtime.
- `DATABASE_URL_UNPOOLED` — conexão direta, usada só pelo script de migração.
- `GEMINI_API_KEY` — interpretação de intenção e explicação do ranking.
- `BRAVE_API_KEY` — busca web e de imagens para encontrar ofertas reais.

## Deploy

```bash
vercel link
vercel env add DATABASE_URL production
vercel env add DATABASE_URL_UNPOOLED production
vercel env add GEMINI_API_KEY production
vercel env add BRAVE_API_KEY production
vercel --prod
```

## Estrutura

- `lib/pipeline.ts` — orquestra a busca: interpreta intenção → busca no Brave → normaliza → dedup → pontua → Gemini explica → persiste no banco.
- `lib/scoring.ts` — score determinístico (preço/avaliação/confiabilidade/entrega/condição), não gerado pela IA.
- `app/api/search/route.ts` — streaming (SSE) do progresso da busca em tempo real.
- `migrations/001_init.sql` — schema (`searches`, `products`, `offers`, `search_results`, `price_history`, `clicks`).
