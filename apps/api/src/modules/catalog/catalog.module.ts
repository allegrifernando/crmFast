import { Module } from '@nestjs/common';
import { FacultyService } from './application/faculty.service';
import { ProgramService } from './application/program.service';
import { CohortService } from './application/cohort.service';
import { FacultyController } from './interface/faculty.controller';
import { ProgramController } from './interface/program.controller';
import { CohortController } from './interface/cohort.controller';

@Module({
  controllers: [FacultyController, ProgramController, CohortController],
  providers: [FacultyService, ProgramService, CohortService],
  exports: [FacultyService, ProgramService, CohortService],
})
export class CatalogModule {}
