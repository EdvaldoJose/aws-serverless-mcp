#!/usr/bin/env node

/**
 * Exemplo de como usar o AWS Serverless MCP Server localmente
 * Este script demonstra como interagir com o servidor MCP via stdio
 */

const { spawn } = require('child_process');
const path = require('path');

class MCPClient {
  constructor() {
    this.requestId = 1;
    this.server = null;
  }

  async start() {
    console.log('🚀 Iniciando AWS Serverless MCP Server...');
    
    const serverPath = path.join(__dirname, 'dist', 'index.js');
    this.server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        AWS_REGION: 'us-east-1'
      }
    });

    this.server.stderr.on('data', (data) => {
      console.log('Server:', data.toString().trim());
    });

    // Aguardar um pouco para o servidor inicializar
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: this.requestId++,
        method,
        params
      };

      let response = '';
      
      const onData = (data) => {
        response += data.toString();
        try {
          const parsed = JSON.parse(response);
          this.server.stdout.removeListener('data', onData);
          resolve(parsed);
        } catch (e) {
          // Ainda não recebeu resposta completa
        }
      };

      this.server.stdout.on('data', onData);
      
      this.server.stdin.write(JSON.stringify(request) + '\n');
      
      setTimeout(() => {
        this.server.stdout.removeListener('data', onData);
        reject(new Error('Timeout'));
      }, 5000);
    });
  }

  async listTools() {
    console.log('\n📋 Listando ferramentas disponíveis...');
    try {
      const response = await this.sendRequest('tools/list');
      if (response.result && response.result.tools) {
        response.result.tools.forEach(tool => {
          console.log(`• ${tool.name}: ${tool.description}`);
        });
      }
      return response;
    } catch (error) {
      console.error('Erro ao listar ferramentas:', error.message);
    }
  }

  async callTool(name, args = {}) {
    console.log(`\n🔧 Chamando ferramenta: ${name}`);
    try {
      const response = await this.sendRequest('tools/call', {
        name,
        arguments: args
      });
      
      if (response.result && response.result.content) {
        response.result.content.forEach(content => {
          if (content.type === 'text') {
            console.log(content.text);
          }
        });
      }
      return response;
    } catch (error) {
      console.error(`Erro ao chamar ${name}:`, error.message);
    }
  }

  async stop() {
    if (this.server) {
      this.server.kill();
    }
  }
}

async function main() {
  const client = new MCPClient();
  
  try {
    await client.start();
    
    // Listar ferramentas disponíveis
    await client.listTools();
    
    // Testar algumas ferramentas
    await client.callTool('get_aws_account_info');
    await client.callTool('list_s3_buckets');
    await client.callTool('list_lambda_functions');
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.stop();
    console.log('\n✅ Exemplo concluído!');
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = MCPClient;
