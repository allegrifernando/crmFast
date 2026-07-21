import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignAdvisorDto {
  @ApiProperty() @IsString() advisorId: string;
  @ApiProperty() @IsString() programId: string;
}

export class RemoveAdvisorDto {
  @ApiProperty() @IsString() programId: string;
}

export class ReassignDto {
  @ApiProperty() @IsString() newAdvisorId: string;
}
