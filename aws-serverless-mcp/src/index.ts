#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import AWS from 'aws-sdk';

// Configurar AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const lambda = new AWS.Lambda();
const cloudwatch = new AWS.CloudWatch();
const sts = new AWS.STS();

class AWSServerlessMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'aws-serverless-mcp-server',
        version: '1.0.0',
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_s3_buckets',
            description: 'Lista todos os buckets S3 na conta AWS',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_s3_bucket_objects',
            description: 'Lista objetos em um bucket S3 específico',
            inputSchema: {
              type: 'object',
              properties: {
                bucketName: {
                  type: 'string',
                  description: 'Nome do bucket S3',
                },
                prefix: {
                  type: 'string',
                  description: 'Prefixo para filtrar objetos (opcional)',
                },
              },
              required: ['bucketName'],
            },
          },
          {
            name: 'list_lambda_functions',
            description: 'Lista todas as funções Lambda na conta AWS',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_lambda_function_info',
            description: 'Obtém informações detalhadas de uma função Lambda',
            inputSchema: {
              type: 'object',
              properties: {
                functionName: {
                  type: 'string',
                  description: 'Nome da função Lambda',
                },
              },
              required: ['functionName'],
            },
          },
          {
            name: 'get_cloudwatch_metrics',
            description: 'Obtém métricas do CloudWatch para um recurso',
            inputSchema: {
              type: 'object',
              properties: {
                namespace: {
                  type: 'string',
                  description: 'Namespace da métrica (ex: AWS/Lambda, AWS/S3)',
                },
                metricName: {
                  type: 'string',
                  description: 'Nome da métrica',
                },
                dimensions: {
                  type: 'array',
                  description: 'Dimensões da métrica',
                  items: {
                    type: 'object',
                    properties: {
                      Name: { type: 'string' },
                      Value: { type: 'string' },
                    },
                  },
                },
              },
              required: ['namespace', 'metricName'],
            },
          },
          {
            name: 'get_aws_account_info',
            description: 'Obtém informações básicas da conta AWS',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ] satisfies Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_s3_buckets':
            return await this.listS3Buckets();

          case 'get_s3_bucket_objects':
            return await this.getS3BucketObjects(args as { bucketName: string; prefix?: string });

          case 'list_lambda_functions':
            return await this.listLambdaFunctions();

          case 'get_lambda_function_info':
            return await this.getLambdaFunctionInfo(args as { functionName: string });

          case 'get_cloudwatch_metrics':
            return await this.getCloudWatchMetrics(args as {
              namespace: string;
              metricName: string;
              dimensions?: Array<{ Name: string; Value: string }>;
            });

          case 'get_aws_account_info':
            return await this.getAWSAccountInfo();

          default:
            throw new Error(`Ferramenta desconhecida: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Erro ao executar ${name}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private async listS3Buckets() {
    const result = await s3.listBuckets().promise();
    const buckets = result.Buckets || [];

    return {
      content: [
        {
          type: 'text',
          text: `Encontrados ${buckets.length} buckets S3:\n\n${buckets
            .map((bucket) => `• ${bucket.Name} (criado em: ${bucket.CreationDate})`)
            .join('\n')}`,
        },
      ],
    };
  }

  private async getS3BucketObjects(args: { bucketName: string; prefix?: string }) {
    const params: AWS.S3.ListObjectsV2Request = {
      Bucket: args.bucketName,
      MaxKeys: 100,
    };

    if (args.prefix) {
      params.Prefix = args.prefix;
    }

    const result = await s3.listObjectsV2(params).promise();
    const objects = result.Contents || [];

    return {
      content: [
        {
          type: 'text',
          text: `Encontrados ${objects.length} objetos no bucket ${args.bucketName}:\n\n${objects
            .map((obj) => `• ${obj.Key} (${obj.Size} bytes, modificado: ${obj.LastModified})`)
            .join('\n')}`,
        },
      ],
    };
  }

  private async listLambdaFunctions() {
    const result = await lambda.listFunctions().promise();
    const functions = result.Functions || [];

    return {
      content: [
        {
          type: 'text',
          text: `Encontradas ${functions.length} funções Lambda:\n\n${functions
            .map((func) => `• ${func.FunctionName} (Runtime: ${func.Runtime}, Última modificação: ${func.LastModified})`)
            .join('\n')}`,
        },
      ],
    };
  }

  private async getLambdaFunctionInfo(args: { functionName: string }) {
    const result = await lambda.getFunction({ FunctionName: args.functionName }).promise();
    const func = result.Configuration;

    if (!func) {
      throw new Error(`Função ${args.functionName} não encontrada`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Informações da função ${func.FunctionName}:
• Runtime: ${func.Runtime}
• Handler: ${func.Handler}
• Timeout: ${func.Timeout}s
• Memory: ${func.MemorySize}MB
• Última modificação: ${func.LastModified}
• Descrição: ${func.Description || 'N/A'}
• ARN: ${func.FunctionArn}`,
        },
      ],
    };
  }

  private async getCloudWatchMetrics(args: {
    namespace: string;
    metricName: string;
    dimensions?: Array<{ Name: string; Value: string }>;
  }) {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Últimas 24 horas

    const params: AWS.CloudWatch.GetMetricStatisticsInput = {
      Namespace: args.namespace,
      MetricName: args.metricName,
      StartTime: startTime,
      EndTime: endTime,
      Period: 3600, // 1 hora
      Statistics: ['Average', 'Maximum', 'Minimum'],
      Dimensions: args.dimensions || [],
    };

    const result = await cloudwatch.getMetricStatistics(params).promise();
    const datapoints = result.Datapoints || [];

    return {
      content: [
        {
          type: 'text',
          text: `Métricas para ${args.metricName} (${args.namespace}):\n\n${datapoints
            .sort((a, b) => (a.Timestamp! > b.Timestamp! ? -1 : 1))
            .slice(0, 10)
            .map((dp) => `• ${dp.Timestamp}: Avg=${dp.Average}, Max=${dp.Maximum}, Min=${dp.Minimum}`)
            .join('\n')}`,
        },
      ],
    };
  }

  private async getAWSAccountInfo() {
    const result = await sts.getCallerIdentity().promise();

    return {
      content: [
        {
          type: 'text',
          text: `Informações da conta AWS:
• Account ID: ${result.Account}
• User ARN: ${result.Arn}
• User ID: ${result.UserId}`,
        },
      ],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('AWS Serverless MCP Server rodando em stdio');
  }
}

const server = new AWSServerlessMCPServer();
server.run().catch(console.error);
