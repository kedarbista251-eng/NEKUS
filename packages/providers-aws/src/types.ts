import { z } from 'zod';

export const AwsIntegrationConfigSchema = z.object({
  roleArn: z
    .string()
    .regex(
      /^arn:aws:iam::\d{12}:role\/[\w+=,.@-]+$/,
      'Must be a valid AWS IAM Role ARN (arn:aws:iam::123456789012:role/RoleName)'
    ),
  externalId: z.string().min(8, 'ExternalId must be at least 8 characters for security'),
  regions: z.array(z.string()).min(1).default(['us-east-1']),
});

export type AwsIntegrationConfig = z.infer<typeof AwsIntegrationConfigSchema>;

export interface ConnectionTestResult {
  success: boolean;
  accountId?: string;
  assumedRoleArn?: string;
  error?: string;
  testedAt: string;
}

export interface DiscoveredResource {
  provider: 'aws';
  accountId: string;
  region: string;
  resourceId: string;
  resourceType: string;
  arn: string;
  tags: Record<string, string>;
  properties: Record<string, unknown>;
  discoveredAt: string;
}
