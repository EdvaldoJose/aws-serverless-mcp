#!/bin/bash

STACK_NAME="aws-serverless-mcp-stack"
REGION="us-east-1"

echo "🚀 Fazendo deploy do AWS Serverless MCP Server..."

# Verificar se SAM CLI está instalado
if ! command -v sam &> /dev/null; then
    echo "❌ SAM CLI não encontrado. Instalando..."
    
    # Instalar SAM CLI no Linux
    wget https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip
    unzip aws-sam-cli-linux-x86_64.zip -d sam-installation
    sudo ./sam-installation/install
    rm -rf sam-installation aws-sam-cli-linux-x86_64.zip
fi

# Build do projeto
echo "🔨 Executando build..."
./build.sh

# Validar template SAM
echo "✅ Validando template SAM..."
sam validate --template template.yaml

# Build SAM
echo "🏗️ Executando SAM build..."
sam build

# Deploy
echo "🚀 Fazendo deploy..."
sam deploy \
    --stack-name $STACK_NAME \
    --region $REGION \
    --capabilities CAPABILITY_IAM \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset

# Obter outputs
echo "📋 Informações do deploy:"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs' \
    --output table

echo "✅ Deploy concluído!"
echo ""
echo "🔗 Para testar a API:"
echo "curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/mcp \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"action\": \"get_aws_account_info\"}'"
