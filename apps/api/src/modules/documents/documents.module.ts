import { Module } from '@nestjs/common';
import { DocumentService } from './application/document.service';
import { DocumentController } from './interface/document.controller';
import { OpportunityModule } from '../opportunities/opportunity.module';

@Module({
  imports: [OpportunityModule],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentsModule {}
