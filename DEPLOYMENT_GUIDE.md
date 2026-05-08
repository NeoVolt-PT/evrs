# EVRS by NeoVolt-PT - Guia de Deployment e Testes

Este guia detalha o processo passo a passo para implementar totalmente a plataforma **EVRS (Electric Vehicle Real Range & Reliability Global Tracker)** utilizando serviços "Zero-Cost" (Free Tiers).

---

## 1. Configuração do Supabase (Base de Dados)
O Supabase vai hospedar a base de dados PostgreSQL onde os dados do web scraper serão gravados.

1. Aceda a [supabase.com](https://supabase.com/) e crie uma conta / inicie sessão.
2. Clique em **"New Project"** e preencha os detalhes (Nome do projeto: `EVRS`, escolha uma password forte e a região mais próxima).
3. Aguarde que a base de dados seja provisionada.
4. No menu lateral esquerdo, vá a **SQL Editor** e clique em **"New Query"**.
5. Copie todo o conteúdo do ficheiro `schema.sql` (disponível na raiz deste projeto) e cole-o no SQL Editor. Clique em **"Run"** para criar as tabelas `vehicles`, `reports` e `stats`.
6. Vá a **Project Settings -> API**. Copie e guarde os seguintes valores (vai precisar deles mais à frente):
   * `Project URL` (Este será o seu `SUPABASE_URL`)
   * `service_role` secret (Este será o seu `SUPABASE_SERVICE_KEY`. **Atenção:** Use a chave *service_role* para garantir que o script Python tem permissões de escrita absolutas em background).

---

## 2. Configuração do Groq API (Agente de IA)
A API do Groq será responsável por analisar os textos do web scraper, traduzi-los e estruturá-los.

1. Aceda a [console.groq.com](https://console.groq.com/) e crie uma conta.
2. Navegue até **API Keys** no painel lateral.
3. Clique em **"Create API Key"**, dê-lhe o nome `EVRS Scraper` e guarde a chave gerada (Este será o seu `GROQ_API_KEY`).

---

## 3. Configuração do Resend (Alertas de E-mail)
O Resend será utilizado tanto pelo Portal (para eventuais erros de backend) como pelo script Python para enviar o resumo semanal das atualizações.

1. Aceda a [resend.com](https://resend.com/) e crie uma conta.
2. Navegue para **API Keys** e clique em **"Create API Key"**.
3. Guarde a chave gerada (Este será o seu `RESEND_API_KEY`).
4. *Nota sobre o Free Tier:* Se não adicionar um domínio próprio, o Resend só permite enviar emails para o endereço de email de registo da sua conta (no caso: `filmfer@gmail.com`). Certifique-se que o email de registo no Resend é este, para que os relatórios sejam entregues.

---

## 4. Configuração do GitHub (Alojamento de Código e Scraper Automático)
O GitHub irá alojar o código e correr os cron-jobs de web scraping gratuitamente.

1. Crie um novo repositório público ou privado no seu [GitHub](https://github.com/).
2. No seu terminal (dentro da pasta `d:/scripts/aers`), execute os seguintes comandos:
   ```bash
   git init
   git add .
   git commit -m "Initial EVRS project by NeoVolt-PT commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USER/SEU_REPOSITORIO.git
   git push -u origin main
   ```
3. No GitHub, vá à página do seu repositório -> **Settings** -> **Secrets and variables** -> **Actions**.
4. Adicione as seguintes **Repository Secrets** (usando os valores que obteve nos passos anteriores):
   * `SUPABASE_URL`
   * `SUPABASE_SERVICE_KEY`
   * `GROQ_API_KEY`
   * `RESEND_API_KEY`
5. *Teste o Scraper:* Vá ao separador **Actions** no repositório GitHub, selecione o workflow "EV Data Scraper" e clique em **"Run workflow"** para realizar o seu primeiro teste do extrator AI. Receberá um e-mail de confirmação do Resend no final da execução.

---

## 5. Configuração da Vercel (Deployment do Portal Web)
A Vercel vai compilar e colocar o portal online na Internet com integração direta com o GitHub.

1. Aceda a [vercel.com](https://vercel.com/) e inicie sessão com o seu GitHub.
2. Clique em **"Add New"** -> **"Project"**.
3. Importe o repositório que acabou de criar (`EVRS`).
4. A Vercel deteta automaticamente que é um projeto Next.js. Não precisa de mudar as definições de compilação.
5. Em **Environment Variables** na Vercel, introduza também o valor:
   * `RESEND_API_KEY` (Para ser consumido pelo sistema interno de gestão de alertas em React).
6. Clique em **Deploy**.

**Parabéns!** O seu portal "EVRS by NeoVolt-PT" está agora online na Internet!
Os agentes de web scraping vão correr em background a cada domingo às 00:00 UTC sem custos de servidor e alimentar continuamente o portal com novos dados.