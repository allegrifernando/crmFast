import { Module } from '@nestjs/common';
import { CalendarService } from './application/calendar.service';
import { CalendarController } from './interface/calendar.controller';

@Module({
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class AgendaModule {}
