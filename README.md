# 🐾 PetCare Anti-Furo

Sistema completo de gestão de agendamentos e confirmação automática de presença via WhatsApp voltado para Pet Shops. Projetado seguindo **Clean Architecture**, **Domain-Driven Design (DDD) pragmático**, **Screaming Architecture (Feature-Based)** e princípios **SOLID**.

---

## 🏛️ Arquitetura do Sistema

```
backend/src/
├── domain/                               # Núcleo de Domínio Compartilhado
│   ├── errors/                           # Erros de domínio e HTTP
│   └── value-objects/                    # Value Objects (ex: PhoneNumber com validação E.164)
├── modules/
│   ├── customers/                        # Feature de Tutores & Pets
│   │   ├── application/use-cases/        # Casos de uso (CreateCustomer, ListCustomers, CreatePet)
│   │   ├── domain/entities/              # Entidades ricas (Customer, Pet)
│   │   ├── domain/repositories/          # Contratos de repositório (ICustomerRepository, IPetRepository)
│   │   ├── infrastructure/repositories/  # Implementação Prisma ORM
│   │   └── presentation/                 # Controllers e Schemas Zod
│   ├── appointments/                     # Feature de Agendamentos
│   │   ├── application/use-cases/        # Casos de uso (Create, List, UpdateStatus, Metrics)
│   │   ├── domain/entities/              # Entidade rica (Appointment com status machine e builder de msg)
│   │   ├── domain/repositories/          # Contrato de repositório (IAppointmentRepository)
│   │   ├── infrastructure/repositories/  # Implementação Prisma ORM
│   │   └── presentation/                 # Controllers e Schemas Zod
│   ├── notifications/                    # Feature de Mensageria WhatsApp
│   │   ├── application/use-cases/        # Casos de uso (TriggerSingleReminder, TriggerBatchReminders)
│   │   ├── domain/ports/                 # Interface do Gateway (IWhatsAppGateway)
│   │   ├── infrastructure/gateways/      # Implementações (EvolutionApiWhatsAppGateway, MockGateway)
│   │   └── presentation/                 # Controllers e Schemas
│   └── webhooks/                         # Feature de Retorno de Webhook (n8n / Evolution API)
│       ├── application/use-cases/        # ProcessWebhookReplyUseCase (Parser seguro e intenções 1 e 2)
│       └── presentation/                 # WebhookController
├── presentation/                         # Servidor Express, Rotas e Middlewares Globais
└── shared/                               # Singleton Prisma e utilitários
```

---

## 🐳 Execução via Docker (Guia Completo de Comandos)

O projeto está totalmente containerizado com **Docker Compose**, orquestrando 4 serviços essenciais:
1. **`postgres`:** Banco de dados relacional PostgreSQL 16 Alpine com healthcheck.
2. **`evolution-api`:** Servidor oficial WhatsApp REST v2 (`evoapicloud/evolution-api:v2.3.7`).
3. **`backend`:** API Node.js TypeScript com Clean Architecture e auto-migração via Prisma.
4. **`frontend`:** Dashboard moderno em React + Tailwind servido via Nginx otimizado.

> 💡 **Nota sobre permissões no Linux:** Se o seu usuário ainda não tiver sido adicionado ao grupo Docker, use `sudo ~/.docker/cli-plugins/docker-compose` ou simplesmente adicione seu usuário uma única vez com:  
> `sudo usermod -aG docker $USER && newgrp docker`

---

### 1. Iniciar a Aplicação (Build & Run)

```bash
# Copie o arquivo de variáveis de ambiente
cp .env.example .env

# Subir todos os serviços em segundo plano com build (Recomendado na primeira vez)
sudo ~/.docker/cli-plugins/docker-compose up --build -d

# Subir rapidamente sem reconstruir as imagens
docker compose up -d

# Subir apenas um serviço específico (ex: apenas a Evolution API)
docker compose up -d evolution-api
```

---

### 2. Acessar os Serviços

| Serviço | URL | Descrição |
| :--- | :--- | :--- |
| **Frontend Dashboard** | [http://localhost:5173](http://localhost:5173) ou [http://localhost](http://localhost) | Painel visual de agendamentos e métricas |
| **Backend API** | [http://localhost:3333/api](http://localhost:3333/api) | Endpoints REST da aplicação |
| **Healthcheck da API** | [http://localhost:3333/api/health](http://localhost:3333/api/health) | Verificação de status do servidor |
| **Webhook WhatsApp** | [http://localhost:3333/api/webhooks/whatsapp](http://localhost:3333/api/webhooks/whatsapp) | Endpoint de retorno de respostas |
| **Evolution API Manager** | [http://localhost:8080/manager](http://localhost:8080/manager) | Painel para escanear QR Code do WhatsApp |

---

### 3. Acompanhar Logs em Tempo Real

```bash
# Ver logs de TODOS os containers juntos (use Ctrl+C para sair)
docker compose logs -f

# Ver logs apenas do BACKEND (disparos WhatsApp e webhooks)
docker compose logs -f backend

# Ver logs apenas da Evolution API (conexão do chip e QR Code)
docker compose logs -f evolution-api

# Ver logs apenas do Frontend Nginx
docker compose logs -f frontend
```

---

### 4. Parar e Desligar (Liberar Recursos da Máquina)

```bash
# Parar e remover todos os containers (Mantém o banco de dados salvo no volume)
docker compose down

# Pausar temporariamente os containers (sem remover)
docker compose stop

# Retomar os containers que estavam pausados
docker compose start

# Reiniciar todos os containers
docker compose restart

# Reset TOTAL: Parar tudo e APAGAR o banco de dados (recria do zero no próximo up)
docker compose down -v
```

---

### 5. Monitoramento & Diagnóstico

```bash
# Listar status dos containers do projeto
docker compose ps

# Ver consumo de Memória RAM e CPU ao vivo de cada container
docker stats
```

---

### 6. Executar Comandos Dentro dos Containers

```bash
# Repovoar o banco com os dados de teste (Seed)
docker compose exec backend npm run seed

# Abrir o terminal dentro do container backend
docker compose exec backend sh

# Acessar diretamente o terminal do PostgreSQL via CLI
docker compose exec postgres psql -U postgres -d petshop_antifuro
```

---

### 7. Interface Gráfica Opcional (Portainer Web UI)

Para quem prefere gerenciar os containers por uma interface visual com botões de Play/Stop e logs com 1 clique:

```bash
# Iniciar o Portainer CE oficial (sem exigência de setup token)
sudo docker run -d -p 9000:9000 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest --no-setup-token
```
- Acesse em: **[http://localhost:9000](http://localhost:9000)**
- Defina uma senha de admin (mínimo 12 caracteres, ex: `Admin@12345678`) e clique em **Create user**.
- Pule a tela de *Edge Compute* e clique em **local** ➔ **Containers**.

---

## 📲 Como Conectar o WhatsApp Real (Evolution API)

1. Com os containers rodando, acesse: **[http://localhost:8080/manager](http://localhost:8080/manager)**
2. No campo **API Key Global**, informe a chave configurada no sistema:
   ```text
   429644463e69881710e69a3ac169490340
   ```
3. Crie a instância com o nome `petshop_bot`.
4. Clique no ícone de **QR Code** para exibir o código na tela.
5. No WhatsApp do seu celular:
   - Vá em **Aparelhos Conectados** ➔ **Conectar um aparelho**.
   - Aponte a câmera e escaneie o QR Code.
6. No painel do PetCare ([http://localhost:5173](http://localhost:5173)), clique no botão **"⚙️ Configurar WhatsApp"**:
   - Defina seu número remetente (ex: `5564993048083`).
   - Alterne para o **Disparo Real**.
   - Digite seu número no campo de teste e clique em **"Disparar Teste"**!

> 💡 **Modo Simulação / Mock:** Se não quiser conectar um celular agora, mantenha selecionada a opção **"🟡 Simulação / Testes"** na tela de configurações. O sistema simulará todos os disparos sem gastar mensagens reais.

---

## 💻 Execução Local sem Docker (Desenvolvimento Alternativo)

### 1. Backend:
```bash
cd backend
npm install
npx prisma generate
npm run setup:local  # Cria o banco SQLite local e executa o seed
npm run dev          # Inicia a API em http://localhost:3333
```

### 2. Frontend:
```bash
cd frontend
npm install
npm run dev          # Inicia o painel em http://localhost:5173
```

---

## 📱 Fluxo Anti-Furo & Webhook WhatsApp

### 1. Mensagem de Lembrete Enviada ao Tutor:
```text
🐾 *PetCare Agendamentos* 🐾

Olá, *Mariana Duarte*! Tudo bem?

Passando para confirmar o agendamento do(a) *Thor*:
📅 *Data:* 18/10/2026
⏰ *Horário:* 09:00
✂️ *Serviço:* Banho e Tosa Completa

Por favor, responda com o número da opção desejada:
*1* - ✅ Confirmar presença
*2* - ❌ Cancelar ou Reagendar
```

### 2. Resposta do Cliente:
- Responde **"1"**, **"sim"** ou **"confirmo"** ➔ Status atualizado instantaneamente para `CONFIRMADO` (Verde).
- Responde **"2"**, **"não"** ou **"cancelar"** ➔ Status atualizado instantaneamente para `CANCELADO_REAGENDAR` (Vermelho).

### 3. Endpoint de Webhook (Evolution API / n8n):
- **URL:** `POST http://localhost:3333/api/webhooks/whatsapp`
- **Payload compatível Evolution API (`messages.upsert`):**
```json
{
  "event": "messages.upsert",
  "data": {
    "key": {
      "remoteJid": "5511998765432@s.whatsapp.net",
      "fromMe": false
    },
    "message": {
      "conversation": "1"
    }
  }
}
```
- **Payload simplificado / n8n:**
```json
{
  "phone": "5511998765432",
  "reply": "1"
}
```

---

## 🧪 Simulador Embutido no Dashboard
No topo do painel, clique em **"Testar Webhook"** para simular o cliente respondendo diretamente do navegador e veja o status na tabela e os cards de métricas mudarem em tempo real!
