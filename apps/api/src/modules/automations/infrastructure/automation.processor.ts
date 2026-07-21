import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AutomationService } from '../application/automation.service';

@Processor('automation')
export class AutomationProcessor extends WorkerHost {
  constructor(private automationService: AutomationService) {
    super();
  }

  async process(job: Job<{ ruleId: string; trigger: string; action: string; config: Record<string, unknown> }>): Promise<void> {
    const { action, config } = job.data;

    switch (action) {
      case 'SEND_NOTIFICATION':
      case 'CREATE_REMINDER':
        if (job.data.trigger === 'INACTIVITY') {
          await this.automationService.processInactivityRule(config);
        } else {
          await this.automationService.processFollowUpRule(config);
        }
        break;
      case 'CREATE_TASK':
        await this.automationService.processAutoTaskRule(config);
        break;
      case 'ASSIGN_LEAD':
        break;
      default:
        break;
    }
  }
}
