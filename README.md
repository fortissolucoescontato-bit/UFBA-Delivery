This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Netlify

A aplicação está configurada para deploy automático e otimizado na **Netlify** utilizando o `netlify.toml` fornecido e o `@netlify/plugin-nextjs`.

### Variáveis de Ambiente Necessárias na Netlify

Ao criar o novo site na interface da Netlify (ou via CLI), certifique-se de configurar as seguintes variáveis de ambiente no painel de **Environment Variables** antes do primeiro build de produção:

- `NEXT_PUBLIC_SUPABASE_URL` (Sua URL REST do projeto Supabase)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Sua Anon Key pública do Supabase)

O deploy usará o comando `npm run build` nativamente e hospedará a pasta `.next`. Devido às salvaguardas implementadas (fallback injection), a plataforma será capaz de realizar a pré-renderização estática mesmo se as chaves atrasarem a injeção inicial do worker de SSR da nuvem.
