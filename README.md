Projeto Servidor MCP Serverless com Amazon-Q
# AWS Serverless MCP Server

Servidor MCP (Model Context Protocol) serverless implementado com AWS Lambda e API Gateway, integrado com Amazon Q CLI.

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Amazon Q CLI  │────│   API Gateway    │────│  Lambda Function │
│                 │    │                  │    │   (MCP Server)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                │                        │
                       ┌────────▼────────┐    ┌─────────▼─────────┐
                       │   CloudWatch    │    │   AWS Services    │
                       │     Logs        │    │  (S3, Lambda,     │
                       │                 │    │   CloudWatch)     │
                       └─────────────────┘    └───────────────────┘
```

## ✨ Funcionalidades

- **Serverless**: Execução sob demanda com AWS Lambda
- **API REST**: Endpoint HTTP via API Gateway
- **Integração AWS**: Acesso a S3, Lambda, CloudWatch
- **Monitoramento**: Logs automáticos no CloudWatch
- **Escalabilidade**: Auto-scaling nativo da AWS

## 🚀 Deploy Rápido

### Pré-requisitos
- AWS CLI configurado
- SAM CLI instalado
- Node.js 18+ instalado

### Comandos
```bash
# Instalar dependências
npm install

# Build do projeto
./build.sh

# Deploy na AWS
./deploy.sh
```

## 📋 Recursos Criados

### AWS Lambda
- **Função**: `aws-serverless-mcp-server`
- **Runtime**: Node.js 18.x
- **Timeout**: 30 segundos
- **Memória**: 128 MB

### API Gateway
- **Endpoint**: `https://0iw1j40354.execute-api.us-east-1.amazonaws.com/prod/mcp`
- **Método**: POST
- **Integração**: Lambda Proxy

### S3 Bucket
- **Demo Bucket**: `aws-mcp-demo-772012827208-us-east-1`
- **Artifacts**: `aws-serverless-mcp-artifacts-772012827208`

### CloudWatch
- **Log Group**: Logs automáticos da função
- **Métricas**: Monitoramento de performance

## 🧪 Testando a API

### Informações da Conta AWS
```bash
curl -X POST https://0iw1j40354.execute-api.us-east-1.amazonaws.com/prod/mcp \
  -H 'Content-Type: application/json' \
  -d '{"action": "get_aws_account_info"}'
```

### Listar Buckets S3
```bash
curl -X POST https://0iw1j40354.execute-api.us-east-1.amazonaws.com/prod/mcp \
  -H 'Content-Type: application/json' \
  -d '{"action": "list_s3_buckets"}'
```

### Listar Funções Lambda
```bash
curl -X POST https://0iw1j40354.execute-api.us-east-1.amazonaws.com/prod/mcp \
  -H 'Content-Type: application/json' \
  -d '{"action": "list_lambda_functions"}'
```

## 🔧 Desenvolvimento Local

### Executar Localmente
```bash
# Instalar dependências
npm install

# Executar servidor local
node example-local.js
```

### Build e Teste
```bash
# Build TypeScript
npm run build

# Executar testes
npm test

# Validar template SAM
sam validate
```

## 📁 Estrutura do Projeto

```
aws-serverless-mcp/
├── src/
│   ├── index.ts              # Servidor MCP principal
│   └── lambda-handler.ts     # Handler para AWS Lambda
├── dist/                     # Arquivos compilados
├── template.yaml             # Template SAM
├── package.json              # Dependências Node.js
├── tsconfig.json            # Configuração TypeScript
├── build.sh                 # Script de build
├── deploy.sh                # Script de deploy
└── README.md                # Esta documentação
```

## 💰 Custos

### Free Tier Incluído
- **Lambda**: 1M invocações/mês
- **API Gateway**: 1M chamadas/mês
- **CloudWatch**: 5GB logs/mês

### Estimativa Mensal
- Uso baixo: $0-5
- Uso médio: $5-20
- Uso alto: $20-50

## 📊 Status do Deploy

✅ **Deploy realizado com sucesso!**

- **Stack**: `aws-serverless-mcp-stack`
- **Região**: `us-east-1`
- **API URL**: `https://0iw1j40354.execute-api.us-east-1.amazonaws.com/prod/mcp`
- **Função Lambda**: `aws-serverless-mcp-server`

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Deploy falha por falta de bucket S3**
   ```bash
   # Criar bucket para artefatos
   aws s3 mb s3://mcp-artifacts-$(aws sts get-caller-identity --query Account --output text)
   ```

2. **Timeout na função Lambda**
   ```bash
   # Aumentar timeout no template.yaml
   Timeout: 60
   ```

3. **Permissões insuficientes**
   ```bash
   # Verificar role da função
   aws iam get-role --role-name aws-serverless-mcp-server-role
   ```

## 📚 Recursos Adicionais

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Amazon Q Developer](https://aws.amazon.com/q/developer/)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)

---

**Desenvolvido com ❤️ usando AWS Serverless e Amazon Q**
