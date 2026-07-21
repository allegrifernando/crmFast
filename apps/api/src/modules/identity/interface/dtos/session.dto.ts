import { ApiProperty } from '@nestjs/swagger';

export class SessionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  lastActivity: Date;

  @ApiProperty()
  isRevoked: boolean;

  @ApiProperty()
  userAgent?: string;

  @ApiProperty()
  ipAddress?: string;
}
