# Configuração do AWS Serverless MCP Server no Q CLI

## 🎯 Objetivo
Integrar o AWS Serverless MCP Server com o Amazon Q CLI para ter acesso direto aos recursos AWS durante conversas.

## 📋 Pré-requisitos
- Amazon Q CLI instalado e configurado
- AWS CLI configurado com credenciais válidas
- Node.js 18+ instalado
- Projeto AWS Serverless MCP Server compilado

## 🔧 Configuração Passo a Passo

### 1. Verificar se o projeto está compilado
```bash
cd /home/eddev/Formacao-AWS/bia-IA-AWS/aws-serverless-mcp
npm run compile
```

### 2. Testar o servidor MCP localmente
```bash
./test.sh
```

### 3. Localizar o arquivo de configuração do Q CLI
O Q CLI procura por configurações MCP em:
- `~/.config/q/mcp.json` (Linux/Mac)
- `%APPDATA%\q\mcp.json` (Windows)

### 4. Criar/Editar o arquivo de configuração MCP
```bash
# Criar diretório se não existir
mkdir -p ~/.config/q

# Copiar configuração
cp q-mcp-config.json ~/.config/q/mcp.json
```

Ou editar manualmente:
```json
{
  "mcpServers": {
    "aws-serverless": {
      "command": "node",
      "args": ["/home/eddev/Formacao-AWS/bia-IA-AWS/aws-serverless-mcp/dist/index.js"],
      "env": {
        "AWS_REGION": "us-east-1",
        "AWS_PROFILE": "default"
      }
    }
  }
}
```

### 5. Reiniciar o Q CLI
```bash
# Se estiver rodando, sair e reiniciar
q chat
```

### 6. Verificar se o MCP Server foi carregado
No Q CLI, você deve ver uma mensagem indicando que o servidor MCP foi carregado.

## 🧪 Testando a Integração

### Comandos de exemplo para testar no Q CLI:

1. **Listar buckets S3:**
   ```
   Liste meus buckets S3
   ```

2. **Obter informações da conta AWS:**
   ```
   Quais são as informações da minha conta AWS?
   ```

3. **Listar funções Lambda:**
   ```
   Mostre minhas funções Lambda
   ```

4. **Verificar objetos em um bucket:**
   ```
   Liste os objetos no bucket [nome-do-bucket]
   ```

## 🔍 Ferramentas Disponíveis

O MCP Server disponibiliza as seguintes ferramentas:

- `aws-serverless___list_s3_buckets`: Lista buckets S3
- `aws-serverless___get_s3_bucket_objects`: Lista objetos de um bucket
- `aws-serverless___list_lambda_functions`: Lista funções Lambda
- `aws-serverless___get_lambda_function_info`: Detalhes de uma função Lambda
- `aws-serverless___get_cloudwatch_metrics`: Métricas do CloudWatch
- `aws-serverless___get_aws_account_info`: Informações da conta AWS

## 🐛 Troubleshooting

### Problema: MCP Server não carrega
**Solução:**
1. Verificar se o caminho no arquivo de configuração está correto
2. Testar o servidor manualmente: `node dist/index.js`
3. Verificar logs do Q CLI

### Problema: Erro de permissões AWS
**Solução:**
1. Verificar credenciais AWS: `aws sts get-caller-identity`
2. Verificar se o usuário tem as permissões necessárias
3. Verificar variável de ambiente AWS_PROFILE

### Problema: Ferramentas não aparecem
**Solução:**
1. Reiniciar o Q CLI completamente
2. Verificar se o arquivo mcp.json está no local correto
3. Verificar sintaxe JSON do arquivo de configuração

## 📝 Logs e Debug

### Para debug, você pode:

1. **Executar o servidor MCP manualmente:**
```bash
cd /home/eddev/Formacao-AWS/bia-IA-AWS/aws-serverless-mcp
node dist/index.js
```

2. **Testar com o exemplo local:**
```bash
./example-local.js
```

3. **Verificar logs do Q CLI:**
```bash
# Logs geralmente estão em ~/.config/q/logs/
ls -la ~/.config/q/logs/
```

## 🚀 Deploy Alternativo (Serverless)

Se preferir usar via API Gateway em vez de local:

1. **Deploy na AWS:**
```bash
./deploy.sh
```

2. **Configurar para usar API:**
```json
{
  "mcpServers": {
    "aws-serverless-api": {
      "command": "curl",
      "args": [
        "-X", "POST",
        "https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/mcp",
        "-H", "Content-Type: application/json",
        "-d"
      ]
    }
  }
}
```

## ✅ Verificação Final

Para confirmar que tudo está funcionando:

1. Abra o Q CLI: `q chat`
2. Digite: "Liste meus buckets S3"
3. O Q deve usar a ferramenta `aws-serverless___list_s3_buckets`
4. Você deve ver a lista dos seus buckets S3

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Q CLI
2. Teste o servidor MCP manualmente
3. Verifique as credenciais AWS
4. Consulte a documentação do MCP: https://modelcontextprotocol.io/
