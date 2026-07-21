import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { AutomationService } from './application/automation.service';
import { AutomationController } from './interface/automation.controller';
import { AutomationProcessor } from './infrastructure/automation.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'automation',
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AutomationController],
  providers: [AutomationService, AutomationProcessor],
  exports: [AutomationService],
})
export class AutomationsModule {}
