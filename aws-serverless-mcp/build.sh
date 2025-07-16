#!/bin/bash

echo "🔨 Construindo AWS Serverless MCP Server..."

# Limpar diretório de build
rm -rf dist/
mkdir -p dist/

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Compilar TypeScript
echo "🔧 Compilando TypeScript..."
npx tsc

# Copiar arquivos necessários
echo "📋 Copiando arquivos..."
cp package.json dist/
cp -r node_modules dist/

# Criar handler principal para Lambda
echo "🚀 Criando handler Lambda..."
cat > dist/index.js << 'EOF'
const { handler } = require('./lambda-handler');
exports.handler = handler;
EOF

echo "✅ Build concluído! Arquivos estão em ./dist/"
echo "📁 Conteúdo do diretório dist:"
ls -la dist/
