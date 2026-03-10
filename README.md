# 🎓 UFBA Delivery

Um marketplace universitário moderno, exclusivo e focado em conectar estudantes para compra e venda de produtos e serviços dentro do campus, de forma segura, rápida e sem taxas!

## 🚀 Funcionalidades

### 🛒 Para o Comprador
*   **Vitrine Viva:** Explore produtos de estudantes de forma visual, com layout "No-Zoom" para ver a foto real de cada anúncio.
*   **Compra Segura V10:** Sistema de checkout integrado ao WhatsApp do vendedor, garantindo flexibilidade total para você negociar a entrega (no campus, reitoria, etc.) e o pagamento (dinheiro, PIX na hora).
*   **Lojas Oficiais & Verificadas:** Saiba quem está vendendo, veja se o vendedor está online e confira a reputação da loja baseada na avaliação de outros estudantes.
*   **Chat em Tempo Real:** Tire dúvidas diretamente com o vendedor antes da compra pelo próprio app.

### 💼 Para o Vendedor
*   **Loja Própria e Gratuita:** Crie sua vitrine virtual, customize com banner e foto de perfil, e compartilhe o link direto para seus clientes fora do app.
*   **Mágica IA (Llama 4 Scout):** Inteligência Artificial integrada! Faça upload da foto do seu produto e a IA analisa a imagem, escreve um título, uma descrição persuasiva e sugere o valor unitário - tudo em segundos!
*   **Dashboard de Vendas:** Acompanhe quantas pessoas viram seus produtos ou visitaram sua loja.
*   **Lucro 100% Seu:** Integre o Mercado Pago e receba pagamentos diretamente sem taxas plataforma. 

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as melhores práticas modernas ("Operação Hardened V3/V10"):
*   **Framework:** Next.js (App Router)
*   **Linguagem:** TypeScript
*   **Integração IA:** Groq (Llama 4 Scout)
*   **Estilização:** Tailwind CSS + Shadcn UI
*   **Banco de Dados & Auth:** Supabase (PostgreSQL, Realtime, Storage, RLS Securer)
*   **Pagamentos:** Mercado Pago SDK

## 📁 Estrutura do Projeto (Full-Stack Next.js)

O projeto utiliza a arquitetura *Full-Stack* nativa do **Next.js**. Isso significa que o front-end e o back-end habitam no mesmo repositório, garantindo agilidade e máxima conectividade:

*   **`app/`**: Rotas da aplicação, Views (Front-end) e Server Actions/API Routes (Back-end protegido).
*   **`components/`**: Componentes da interface de usuário (UI).
*   **`lib/`**: Configurações de serviços externos (ex: Mercado Pago, Groq).
*   **`database_scripts/`**: Scripts fundamentais de configuração e inicialização de tabelas e banco de dados Supabase.
*   **`public/`**: Assets estáticos do projeto.

## ⚙️ Como Rodar Localmente

Siga as instruções abaixo para ativar a plataforma no seu ambiente:

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🔐 Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis de segurança:

```env
# Banco de Dados & Auth
NEXT_PUBLIC_SUPABASE_URL="sua_url_supabase"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_chave_anon_supabase"

# Inteligência Artificial
GROQ_API_KEY="sua_chave_api_groq"

# Pagamentos (Opcional para ambiente de dev base)
MP_ACCESS_TOKEN="seu_token_mercado_pago"
```

## ✨ Atualizações Recentes - Performance e Mágica IA de Elite

A plataforma recebeu recentemente atualizações de infraestrutura pesada (padrão de performance e AI):

### Mágica IA Otimizada (Groq/Llama 4 Scout)
A funcionalidade de preencher o anúncio automaticamente via IA foi atualizada para comprimir imagens no *Client-Side* antes do envio. Isso evita problemas de rede, o clássico erro "Payload Too Large" e economiza largura de banda, sendo perfeito para usuários com conexões instáveis de internet pelo campus.

### Performance e Segurança no Banco de Dados (PostgreSQL)
A estrutura de banco de dados sofreu uma varredura rigorosa com base no `@postgres-best-practices` e na inteligência de auditoria do Supabase:
* **Consultas Supersônicas:** Adição de índices estratégicos em chaves estrangeiras (Foreign Keys), erradicando *Sequential Scans* e limpando índices mortos e/ou duplicados.
* **Segurança "Blindada" e RLS O(1):** Todas as funções de RPC/Triggers operam com `security definer` e `search_path = public`. Em complemento, **toda** as políticas de Row-Level Security (RLS) foram refatoradas para blindar o "Planner" do banco contra bottlenecks de *InitPlan* (trocando chamadas lentas como `auth.uid()` para escopo isolado `(select auth.uid())`), transformando verificações de regras camada a camada de `O(N²)` para `O(1)`.
* **Pronto para Escalar:** As tabelas (e chat em tempo real) agora suportarão tráfego extremo sem latência e sem sobrecarregar a CPU da nuvem em cálculos redundantes.

### 🛡️ Auditoria de Segurança Zero Trust
Foi implementada uma bateria de verificações DevSecOps:
* **Proteção Global (Middleware):** A `middleware.ts` foi instalada na raiz do projeto (como exigido pela arquitetura App Router), bloqueando o acesso de visitantes não autenticados/anônimos a rotas estritas de gerenciamento (`/vendedor/*`).
* **Sessão Estrita:** A verificação contra double-stringify no `localStorage` neutraliza "Sessões Fantasmas", forçando o uso do *Server-Side Cookies* para as credenciais principais HTTP-Only.
* **Correção de IDOR no Storage (Cloud):** Varreduras de RLS identificaram uma brecha na tabela `storage.objects` que permitia remoção de avatares por terceiros. As políticas foram endurecidas de `auth.role() = 'authenticated'` para controle *Owner-Only* restrito `(select auth.uid()) = owner`.

### 💎 UX Premium & UI High Craft
A consistência visual (V10) foi nivelada em todo o projeto:
* **Micro-interações:** Hover-lifts, glassmorphism de produção nas Navbars e padronização das tipografias e bordas ultra arredondadas (`rounded-[2rem]`, aspect-square).
* **Mobile First:** Os actions flutuantes (como os botões rápidos de compra e carrinho interno) foram testados para a zona do polegar (Thumb Zone Perfect).
* **Sistema de Cores Isolado Escapado:** Prevenção total a Injeção XSS em lojas de vendedores com personalização avançada do *Brand Color* gerida pelas CSS Variables em tempo de execução via Inline CSS seguro.

> **Atenção (Administrador):** Acesse as configurações da Auth no seu Painel Supabase Nuvem via navegador, navegue até os "Providers" (Email) e **ative o Leaked Password Protection**. Esta é a única camada que precisa de ativação manual fora do código para evitar senhas comprometidas na Dark Web.

---
**Desenvolvido para revolucionar a forma como a comunidade acadêmica interage. O shopping universitário do futuro começa aqui.**
