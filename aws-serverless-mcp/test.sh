#!/bin/bash

echo "🧪 Testando AWS Serverless MCP Server..."

# Verificar se o build foi feito
if [ ! -d "dist" ]; then
    echo "❌ Diretório dist não encontrado. Execute ./build.sh primeiro."
    exit 1
fi

# Testar compilação
echo "✅ Verificando compilação..."
node -c dist/index.js
if [ $? -eq 0 ]; then
    echo "✅ Compilação OK"
else
    echo "❌ Erro na compilação"
    exit 1
fi

# Testar handler Lambda
echo "✅ Verificando handler Lambda..."
node -c dist/lambda-handler.js
if [ $? -eq 0 ]; then
    echo "✅ Handler Lambda OK"
else
    echo "❌ Erro no handler Lambda"
    exit 1
fi

# Verificar se as credenciais AWS estão configuradas
echo "🔑 Verificando credenciais AWS..."
aws sts get-caller-identity > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Credenciais AWS OK"
    aws sts get-caller-identity --output table
else
    echo "❌ Credenciais AWS não configuradas"
    echo "Execute: aws configure"
    exit 1
fi

# Testar algumas funções básicas
echo "🔍 Testando funções básicas..."

# Criar um arquivo de teste para o MCP
cat > test-mcp.js << 'EOF'
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

async function testBasicFunctions() {
    try {
        // Testar STS
        const sts = new AWS.STS();
        const identity = await sts.getCallerIdentity().promise();
        console.log('✅ STS OK - Account:', identity.Account);

        // Testar S3
        const s3 = new AWS.S3();
        const buckets = await s3.listBuckets().promise();
        console.log('✅ S3 OK - Buckets:', buckets.Buckets.length);

        // Testar Lambda
        const lambda = new AWS.Lambda();
        const functions = await lambda.listFunctions().promise();
        console.log('✅ Lambda OK - Functions:', functions.Functions.length);

        console.log('🎉 Todos os testes básicos passaram!');
    } catch (error) {
        console.error('❌ Erro nos testes:', error.message);
        process.exit(1);
    }
}

testBasicFunctions();
EOF

node test-mcp.js
rm test-mcp.js

echo ""
echo "🎉 Testes concluídos com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute ./deploy.sh para fazer deploy na AWS"
echo "2. Ou execute npm run dev para testar localmente"
echo "3. Configure o MCP no Q CLI usando mcp-config.json"
