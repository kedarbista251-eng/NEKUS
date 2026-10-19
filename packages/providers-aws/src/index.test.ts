import { describe, it, expect } from 'vitest';
import { AwsIntegrationConfigSchema } from './types.js';
import { AwsProviderAdapter } from './adapter.js';

describe('AWS Provider Adapter Verification', () => {
  it('should validate well-formed AWS IAM Role ARNs and ExternalId', () => {
    const validConfig = {
      roleArn: 'arn:aws:iam::123456789012:role/NexusReadOnlyDiscoveryRole',
      externalId: 'sec-ext-9402834-xyz',
      regions: ['us-east-1', 'eu-west-1'],
    };
    const result = AwsIntegrationConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('should reject malformed or non-role ARNs to prevent credential abuse', () => {
    const invalidConfig = {
      roleArn: 'arn:aws:s3:::my-bucket',
      externalId: 'short',
    };
    const result = AwsIntegrationConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('should return honest failure when attempting STS AssumeRole with non-existent role without faking success', async () => {
    const adapter = new AwsProviderAdapter('us-east-1');
    const result = await adapter.testConnection({
      roleArn: 'arn:aws:iam::111122223333:role/NonExistentRole',
      externalId: 'valid-format-external-id',
      regions: ['us-east-1'],
    });

    // Must report success: false and provide genuine error context
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.testedAt).toBeDefined();
  });
});
