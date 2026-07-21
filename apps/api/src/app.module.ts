import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { IdentityModule } from './modules/identity/identity.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { PipelineModule } from './modules/pipeline/pipeline.module';
import { AssignmentModule } from './modules/assignment/assignment.module';
import { OpportunityModule } from './modules/opportunities/opportunity.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { AutomationsModule } from './modules/automations/automations.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    BullModule.forRoot({
      connection: process.env.REDIS_URL
        ? { url: process.env.REDIS_URL }
        : {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD || undefined,
          },
    }),
    PrismaModule,
    IdentityModule,
    CatalogModule,
    ContactsModule,
    PipelineModule,
    AssignmentModule,
    OpportunityModule,
    ActivitiesModule,
    AgendaModule,
    CampaignsModule,
    ReportingModule,
    AutomationsModule,
    DocumentsModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
