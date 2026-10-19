import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { EC2Client, DescribeVpcsCommand } from '@aws-sdk/client-ec2';
import { createLogger } from '@nexus/observability';
import {
  AwsIntegrationConfig,
  ConnectionTestResult,
  DiscoveredResource,
} from './types.js';

const logger = createLogger('nexus-providers-aws');

export class AwsProviderAdapter {
  private stsClient: STSClient;

  constructor(region: string = 'us-east-1') {
    this.stsClient = new STSClient({ region });
  }

  /**
   * Tests AWS AssumeRole cross-account connection without fabricating success
   */
  async testConnection(config: AwsIntegrationConfig): Promise<ConnectionTestResult> {
    const testedAt = new Date().toISOString();
    try {
      const command = new AssumeRoleCommand({
        RoleArn: config.roleArn,
        RoleSessionName: `nexus-verify-${Date.now()}`,
        ExternalId: config.externalId,
        DurationSeconds: 900, // 15-minute verification session
      });

      const response = await this.stsClient.send(command);

      if (!response.Credentials || !response.AssumedRoleUser) {
        return {
          success: false,
          error: 'AssumeRole response did not include temporary session credentials.',
          testedAt,
        };
      }

      // Extract AWS Account ID from the AssumedRoleUser ARN
      const assumedArn = response.AssumedRoleUser.Arn || '';
      const accountMatch = assumedArn.match(/arn:aws:sts::(\d{12}):assumed-role/);
      const accountId = accountMatch ? accountMatch[1] : undefined;

      return {
        success: true,
        accountId,
        assumedRoleArn: assumedArn,
        testedAt,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error during AWS AssumeRole execution';
      logger.warn({ roleArn: config.roleArn, err: errorMessage }, 'AWS connection check failed');
      return {
        success: false,
        error: errorMessage,
        testedAt,
      };
    }
  }

  /**
   * Discovers VPCs in target AWS account using assumed role credentials
   */
  async discoverVpcs(
    config: AwsIntegrationConfig,
    credentials: { accessKeyId: string; secretAccessKey: string; sessionToken: string },
    region: string
  ): Promise<DiscoveredResource[]> {
    const ec2 = new EC2Client({
      region,
      credentials,
    });

    const command = new DescribeVpcsCommand({});
    const response = await ec2.send(command);
    const discoveredAt = new Date().toISOString();

    const results: DiscoveredResource[] = [];

    for (const vpc of response.Vpcs || []) {
      if (!vpc.VpcId) continue;

      const tags: Record<string, string> = {};
      vpc.Tags?.forEach((t) => {
        if (t.Key && t.Value) tags[t.Key] = t.Value;
      });

      // Extract account ID from OwnerId if available
      const accountId = vpc.OwnerId || 'unknown';

      results.push({
        provider: 'aws',
        accountId,
        region,
        resourceId: vpc.VpcId,
        resourceType: 'aws:ec2:vpc',
        arn: `arn:aws:ec2:${region}:${accountId}:vpc/${vpc.VpcId}`,
        tags,
        properties: {
          cidrBlock: vpc.CidrBlock,
          isDefault: vpc.IsDefault,
          state: vpc.State,
        },
        discoveredAt,
      });
    }

    return results;
  }
}
