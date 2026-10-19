import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBody } from '@nestjs/swagger';
import { z } from 'zod';
import { createLogger } from '@nexus/observability';

const logger = createLogger('nexus-telemetry-ingest');

const OtlpLogRecordSchema = z.object({
  timeUnixNano: z.string().optional(),
  severityText: z.string().optional(),
  body: z.record(z.unknown()).or(z.string()).optional(),
  attributes: z.array(z.object({ key: z.string(), value: z.unknown() })).optional(),
});

const OtlpLogsPayloadSchema = z.object({
  resourceLogs: z.array(
    z.object({
      resource: z.record(z.unknown()).optional(),
      scopeLogs: z.array(
        z.object({
          logRecords: z.array(OtlpLogRecordSchema),
        })
      ),
    })
  ),
});

export type OtlpLogsPayload = z.infer<typeof OtlpLogsPayloadSchema>;

@ApiTags('Telemetry Ingestion')
@Controller('v1/ingest/otlp/v1')
export class TelemetryController {
  @Post('logs')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Standard OpenTelemetry (OTLP/HTTP) Logs Ingestion Endpoint',
  })
  @ApiHeader({
    name: 'X-Nexus-Ingest-Token',
    description: 'Tenant Telemetry Source Bearer/Ingest Token',
    required: true,
  })
  @ApiResponse({ status: 202, description: 'Batch accepted for deduplication and processing' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Invalid or missing ingest token' })
  @ApiResponse({ status: 400, description: 'Malformed OTLP payload rejected' })
  async ingestOtlpLogs(
    @Headers('x-nexus-ingest-token') token: string,
    @Body() body: unknown
  ) {
    if (!token || token.trim().length < 16) {
      throw new UnauthorizedException(
        'Missing or invalid X-Nexus-Ingest-Token. Ingestion rejected.'
      );
    }

    const parsed = OtlpLogsPayloadSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn({ issues: parsed.error.issues }, 'Rejected malformed OTLP log batch');
      throw new BadRequestException({
        message: 'Malformed OTLP log record payload',
        details: parsed.error.issues,
      });
    }

    // Count records in the OTLP batch
    let recordCount = 0;
    for (const resLog of parsed.data.resourceLogs) {
      for (const scopeLog of resLog.scopeLogs) {
        recordCount += scopeLog.logRecords.length;
      }
    }

    logger.info({ recordCount }, 'Accepted verified OTLP log payload');

    return {
      status: 'accepted',
      recordsProcessed: recordCount,
      timestamp: new Date().toISOString(),
    };
  }
}
