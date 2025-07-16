# AWS Serverless MCP Server

Um servidor MCP (Model Context Protocol) serverless que utiliza apenas recursos gratuitos da AWS.

## 🎯 Recursos Incluídos

### Serviços AWS (Free Tier)
- **AWS Lambda**: Função serverless para processar requisições MCP
- **API Gateway**: Endpoint REST para comunicação HTTP
- **S3**: Bucket de demonstração para testes
- **CloudWatch**: Logs e métricas (7 dias de retenção)
- **IAM**: Políticas e roles com permissões mínimas

### Funcionalidades MCP
- `list_s3_buckets`: Lista todos os buckets S3
- `get_s3_bucket_objects`: Lista objetos de um bucket específico
- `list_lambda_functions`: Lista todas as funções Lambda
- `get_lambda_function_info`: Informações detalhadas de uma função Lambda
- `get_cloudwatch_metrics`: Métricas do CloudWatch
- `get_aws_account_info`: Informações básicas da conta AWS

## 🚀 Instalação e Deploy

### Pré-requisitos
- Node.js 18+
- AWS CLI configurado
- Credenciais AWS com permissões adequadas

### 1. Instalar dependências
```bash
cd aws-serverless-mcp
npm install
```

### 2. Build do projeto
```bash
./build.sh
```

### 3. Deploy na AWS
```bash
./deploy.sh
```

## 🔧 Configuração Local

### Para usar como servidor MCP local:

1. **Build do projeto:**
```bash
npm run build
```

2. **Executar localmente:**
```bash
npm run dev
```

3. **Configurar no Q CLI:**
Adicione ao seu arquivo de configuração MCP:
```json
{
  "mcpServers": {
    "aws-serverless": {
      "command": "node",
      "args": ["/caminho/para/aws-serverless-mcp/dist/index.js"],
      "env": {
        "AWS_REGION": "us-east-1"
      }
    }
  }
}
```

## 🌐 Uso via API Gateway

Após o deploy, você pode usar a API REST:

```bash
# Obter informações da conta
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/mcp \
  -H 'Content-Type: application/json' \
  -d '{"action": "get_aws_account_info"}'

# Listar buckets S3
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/mcp \
  -H 'Content-Type: application/json' \
  -d '{"action": "list_s3_buckets"}'

# Listar funções Lambda
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/mcp \
  -H 'Content-Type: application/json' \
  -d '{"action": "list_lambda_functions"}'
```

## 💰 Custos (Free Tier)

Este projeto foi projetado para usar apenas recursos gratuitos:

- **Lambda**: 1M requisições/mês + 400.000 GB-segundos
- **API Gateway**: 1M chamadas/mês
- **S3**: 5GB de armazenamento + 20.000 requisições GET + 2.000 PUT
- **CloudWatch**: 10 métricas personalizadas + 5GB de logs

## 🔒 Segurança

- Políticas IAM com permissões mínimas
- Bucket S3 com acesso público bloqueado
- CORS configurado no API Gateway
- Logs do CloudWatch com retenção limitada

## 🛠️ Desenvolvimento

### Estrutura do projeto:
```
aws-serverless-mcp/
├── src/
│   ├── index.ts              # Servidor MCP principal
│   └── lambda-handler.ts     # Handler para Lambda/API Gateway
├── template.yaml             # Template SAM
├── package.json
├── tsconfig.json
├── build.sh                  # Script de build
├── deploy.sh                 # Script de deploy
└── README.md
```

### Scripts disponíveis:
- `npm run build`: Compila TypeScript
- `npm run dev`: Executa em modo desenvolvimento
- `./build.sh`: Build completo para deploy
- `./deploy.sh`: Deploy na AWS

## 🔍 Monitoramento

Após o deploy, você pode monitorar:

1. **CloudWatch Logs**: `/aws/lambda/aws-serverless-mcp-server`
2. **CloudWatch Metrics**: Métricas da função Lambda
3. **API Gateway**: Logs de acesso e métricas

## 🧹 Limpeza

Para remover todos os recursos:

```bash
aws cloudformation delete-stack --stack-name aws-serverless-mcp-stack --region us-east-1
```

## 📝 Exemplos de Uso

### Via MCP (Q CLI):
```
Você: Liste meus buckets S3
Q: [usando aws-serverless___list_s3_buckets]
```

### Via API REST:
```javascript
const response = await fetch('https://api-url/prod/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'get_s3_bucket_objects',
    parameters: { bucketName: 'meu-bucket' }
  })
});
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
