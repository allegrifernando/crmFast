import { Module } from '@nestjs/common';
import { OpportunityService } from './application/opportunity.service';
import { OpportunityController } from './interface/opportunity.controller';
import { AssignmentModule } from '../assignment/assignment.module';

@Module({
  imports: [AssignmentModule],
  controllers: [OpportunityController],
  providers: [OpportunityService],
  exports: [OpportunityService],
})
export class OpportunityModule {}
