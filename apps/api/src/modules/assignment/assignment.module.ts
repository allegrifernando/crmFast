import { Module } from '@nestjs/common';
import { AssignmentService } from './application/assignment.service';
import { AssignmentController } from './interface/assignment.controller';

@Module({
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}
