import { Module } from '@nestjs/common';
import { ContactService } from './application/contact.service';
import { ContactController } from './interface/contact.controller';

@Module({
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactsModule {}
