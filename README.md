# Hub Open Finance AI - Dashboard de Crédito e ESG 🚀

Este projeto é um ecossistema completo de **Open Finance**, utilizando Inteligência Artificial para transformar dados bancários brutos em **Score de Crédito Alternativo** e **Indicadores de Impacto ESG**.

## 📖 O Contexto: Do Caos de Dados ao "Score Verde"

No cenário atual do Open Finance Brasil, as instituições financeiras recebem uma avalanche de dados brutos (Camada Bronze), mas enfrentam um abismo técnico: como transformar descrições de faturas confusas em decisões de crédito inteligentes e sustentáveis?

Este projeto simula um ecossistema de produção que resolve esse problema através de uma Pipeline Medallion orientada por IAs:

O Problema: Dados de transações bancárias são ruidosos, sem categoria clara e ignoram o impacto ambiental do consumo.

A Solução: Implementamos um motor de processamento assíncrono onde o Google Vertex AI atua como um Analista Sênior, realizando a categorização semântica e atribuindo notas de impacto ESG a cada transação.

A Visão: O resultado final é o BFF (Backend for Frontend) que entrega um Score de Crédito Alternativo, onde clientes que consomem de forma sustentável recebem um "Bônus Verde" de 10% em sua pontuação final.

Impacto de Negócio: Redução da assimetria de informação, democratização do crédito para perfis modernos e incentivo direto à economia sustentável através de benefícios financeiros reais.

## 🌟 Diferenciais do Projeto

- **Arquitetura Medallion:** Processamento de dados dividido em camadas (Bronze, Silver, Gold).
- **IA Semântica:** Uso do Google Vertex AI para categorização inteligente de gastos.
- **Bônus Verde:** Algoritmo que bonifica o Score de Crédito com base em comportamento ESG.
- **Infraestrutura Escalável:** Orquestração via Docker, Nginx (API Gateway) e n8n.

## 🛠️ Stack Tecnológica

- **Backend/Orquestração:** [n8n](https://n8n.io/)
- **IA/LLM:** Google Vertex AI (Gemini 1.5 Pro)
- **Banco de Dados:** PostgreSQL 16
- **Proxy/Gateway:** Nginx
- **Frontend:** Vanilla JS, TailwindCSS, Chart.js
- **Containerização:** Docker & Docker Compose

## 📐 Arquitetura do Sistema (C4 Model)

O fluxo de dados segue o padrão de microsserviços:

1. **Frontend** solicita dados ao **Nginx (Porta 80)**.
2. **Nginx** atua como Proxy Reverso, encaminhando para o **n8n**.
3. **n8n** consome do **PostgreSQL** (Camada Gold) e retorna o JSON enriquecido.

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para subir o ecossistema completo (Infraestrutura, Banco de Dados, Orquestração e Frontend) em sua máquina local.

### 1. Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Docker & Docker Compose** (Essencial para a orquestração dos serviços).
2. Uma conta no **Google Cloud Platform** com a API **Vertex AI** habilitada para o processamento de linguagem natural.

### 2. Instalação e Configuração

**A. Clone o repositório:**
```Bash
git clone https://github.com/Apolo442/Open-Finance-ETL.git
cd Open-Finance-ETL
```

**B. Configure as Variáveis de Ambiente:**
Crie um arquivo .env na raiz do projeto (use o .env.example se disponível) e adicione suas chaves:
```Bash
GOOGLE_VERTEX_AI_KEY=sua_chave_aqui
POSTGRES_USER=n8n_user
POSTGRES_PASSWORD=sua_senha
```

**C. Suba a Infraestrutura via Docker:**
Execute o comando abaixo para iniciar os containers do PostgreSQL, n8n, Nginx e o Dashboard:

```Bash
docker-compose up -d
```

### 3. Configuração do n8n
- Acesse o n8n em http://localhost:5678.

- Importe os arquivos .json localizados na pasta /workflows deste repositório.

Importante: Dentro do n8n, configure as credenciais do PostgreSQL utilizando os dados definidos no seu .env.

- Ative os três workflows: Consentimento, Medallion Pipeline e API REST.

### 4. Inicialização de Dados (Seeding)
Para visualizar o dashboard com dados reais, execute o workflow de Consentimento uma vez ou utilize o nó de Seeding para popular o PostgreSQL com os perfis de teste.

### 5. Acesso ao Dashboard
Abra seu navegador e acesse a interface através do Proxy Reverso do Nginx:
```Bash
http://localhost
```

---

### 🛠️ Estrutura de Portas (Internas)
Caso precise depurar os serviços individualmente:

- **Dashboard (Nginx):** Porta 80
- **n8n (Orquestrador):** Porta 5678
- **PostgreSQL:** Porta 5432
