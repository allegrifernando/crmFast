import { Module } from '@nestjs/common';
import { PipelineService } from './application/pipeline.service';
import { PipelineController } from './interface/pipeline.controller';

@Module({
  controllers: [PipelineController],
  providers: [PipelineService],
  exports: [PipelineService],
})
export class PipelineModule {}
