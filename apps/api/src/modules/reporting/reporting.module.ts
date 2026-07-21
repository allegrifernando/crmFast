import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportingService } from './application/reporting.service';
import { ReportingController } from './interface/reporting.controller';
import { ReportingProcessor } from './infrastructure/reporting.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'reporting' }),
    ScheduleModule.forRoot(),
  ],
  controllers: [ReportingController],
  providers: [ReportingService, ReportingProcessor],
  exports: [ReportingService],
})
export class ReportingModule {}