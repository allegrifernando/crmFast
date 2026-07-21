import { Module } from '@nestjs/common';
import { CampaignService } from './application/campaign.service';
import { CampaignController } from './interface/campaign.controller';

@Module({
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [CampaignService],
})
export class CampaignsModule {}