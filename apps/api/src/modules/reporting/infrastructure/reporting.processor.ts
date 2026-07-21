import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ReportingService } from '../application/reporting.service';

@Processor('reporting')
export class ReportingProcessor extends WorkerHost {
  constructor(private reportingService: ReportingService) {
    super();
  }

  async process(job: Job<{ format: string; reportType: string; filters?: any }>): Promise<void> {
    // In production: generate PDF/Excel/CSV and store/upload
    // For now: just log
    console.log(`Export job: ${job.data.reportType} as ${job.data.format}`);
  }
}