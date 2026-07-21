import { Module } from '@nestjs/common';
import { ActivityService } from './application/activity.service';
import { ActivityController } from './interface/activity.controller';

@Module({
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivitiesModule {}
