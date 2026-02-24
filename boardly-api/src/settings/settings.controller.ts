import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UpsertCompanySettingsDto } from './dto/upsert-company-settings.dto';
import { SettingsService } from './settings.service';

interface AuthenticatedRequest {
  user: {
    id: string;
  };
}

@UseGuards(AuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('company')
  getCompanySettings(@Req() req: AuthenticatedRequest) {
    return this.settingsService.getCompanySettings(req.user.id);
  }

  @Put('company')
  upsertCompanySettings(
    @Req() req: AuthenticatedRequest,
    @Body() payload: UpsertCompanySettingsDto,
  ) {
    return this.settingsService.upsertCompanySettings(req.user.id, payload);
  }
}
