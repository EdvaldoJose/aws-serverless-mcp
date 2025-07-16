import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';

// Configurar AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const lambda = new AWS.Lambda();
const cloudwatch = new AWS.CloudWatch();
const sts = new AWS.STS();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Body da requisição é obrigatório' })
      };
    }

    const request = JSON.parse(event.body);
    const { action, parameters = {} } = request;

    let result;

    switch (action) {
      case 'list_s3_buckets':
        result = await listS3Buckets();
        break;

      case 'get_s3_bucket_objects':
        result = await getS3BucketObjects(parameters);
        break;

      case 'list_lambda_functions':
        result = await listLambdaFunctions();
        break;

      case 'get_lambda_function_info':
        result = await getLambdaFunctionInfo(parameters);
        break;

      case 'get_cloudwatch_metrics':
        result = await getCloudWatchMetrics(parameters);
        break;

      case 'get_aws_account_info':
        result = await getAWSAccountInfo();
        break;

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Ação desconhecida: ${action}` })
        };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: result })
    };

  } catch (error) {
    console.error('Erro no handler:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      })
    };
  }
};

async function listS3Buckets() {
  const result = await s3.listBuckets().promise();
  const buckets = result.Buckets || [];

  return {
    buckets: buckets.map(bucket => ({
      name: bucket.Name,
      creationDate: bucket.CreationDate
    })),
    count: buckets.length
  };
}

async function getS3BucketObjects(params: { bucketName: string; prefix?: string }) {
  const s3Params: AWS.S3.ListObjectsV2Request = {
    Bucket: params.bucketName,
    MaxKeys: 100,
  };

  if (params.prefix) {
    s3Params.Prefix = params.prefix;
  }

  const result = await s3.listObjectsV2(s3Params).promise();
  const objects = result.Contents || [];

  return {
    objects: objects.map(obj => ({
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified,
      etag: obj.ETag
    })),
    count: objects.length,
    bucket: params.bucketName
  };
}

async function listLambdaFunctions() {
  const result = await lambda.listFunctions().promise();
  const functions = result.Functions || [];

  return {
    functions: functions.map(func => ({
      name: func.FunctionName,
      runtime: func.Runtime,
      lastModified: func.LastModified,
      description: func.Description,
      memorySize: func.MemorySize,
      timeout: func.Timeout
    })),
    count: functions.length
  };
}

async function getLambdaFunctionInfo(params: { functionName: string }) {
  const result = await lambda.getFunction({ FunctionName: params.functionName }).promise();
  const func = result.Configuration;

  if (!func) {
    throw new Error(`Função ${params.functionName} não encontrada`);
  }

  return {
    functionName: func.FunctionName,
    runtime: func.Runtime,
    handler: func.Handler,
    timeout: func.Timeout,
    memorySize: func.MemorySize,
    lastModified: func.LastModified,
    description: func.Description,
    arn: func.FunctionArn,
    codeSize: func.CodeSize,
    version: func.Version
  };
}

async function getCloudWatchMetrics(params: {
  namespace: string;
  metricName: string;
  dimensions?: Array<{ Name: string; Value: string }>;
}) {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Últimas 24 horas

  const cwParams: AWS.CloudWatch.GetMetricStatisticsInput = {
    Namespace: params.namespace,
    MetricName: params.metricName,
    StartTime: startTime,
    EndTime: endTime,
    Period: 3600, // 1 hora
    Statistics: ['Average', 'Maximum', 'Minimum'],
    Dimensions: params.dimensions || [],
  };

  const result = await cloudwatch.getMetricStatistics(cwParams).promise();
  const datapoints = result.Datapoints || [];

  return {
    namespace: params.namespace,
    metricName: params.metricName,
    datapoints: datapoints
      .sort((a, b) => (a.Timestamp! > b.Timestamp! ? -1 : 1))
      .slice(0, 10)
      .map(dp => ({
        timestamp: dp.Timestamp,
        average: dp.Average,
        maximum: dp.Maximum,
        minimum: dp.Minimum
      })),
    count: datapoints.length
  };
}

async function getAWSAccountInfo() {
  const result = await sts.getCallerIdentity().promise();

  return {
    accountId: result.Account,
    userArn: result.Arn,
    userId: result.UserId
  };
}
