import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpsertCompanySettingsDto } from './dto/upsert-company-settings.dto';

interface CompanySettingsRow {
  tenant_id: string;
  work_start: string;
  work_end: string;
  work_days: string[];
  primary_color: string;
}

interface TenantRow {
  id: string;
  name: string;
}

interface UserTenantRow {
  tenant_id: string;
  email: string;
}

@Injectable()
export class SettingsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getCompanySettings(userId: string) {
    const { tenant } = await this.getUserTenant(userId);
    const defaults = {
      companyName: tenant.name,
      workStart: '09:00',
      workEnd: '18:00',
      workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      primaryColor: '#6366F1',
    };

    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('company_settings')
      .select('tenant_id, work_start, work_end, work_days, primary_color')
      .eq('tenant_id', tenant.id)
      .maybeSingle<CompanySettingsRow>();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      return defaults;
    }

    return {
      companyName: tenant.name,
      workStart: data.work_start || defaults.workStart,
      workEnd: data.work_end || defaults.workEnd,
      workDays:
        Array.isArray(data.work_days) && data.work_days.length
          ? data.work_days
          : defaults.workDays,
      primaryColor: data.primary_color || defaults.primaryColor,
    };
  }

  async upsertCompanySettings(
    userId: string,
    payload: UpsertCompanySettingsDto,
  ) {
    this.validatePayload(payload);

    const { user, tenant } = await this.getUserTenant(userId);
    const supabase = this.supabaseService.getClient();

    const { error: tenantUpdateError } = await supabase
      .from('tenants')
      .update({ name: payload.companyName })
      .eq('id', tenant.id);

    if (tenantUpdateError) {
      throw new BadRequestException(
        `Failed to update tenant: ${tenantUpdateError.message}`,
      );
    }

    const settingsPayload = {
      tenant_id: tenant.id,
      email: user.email,
      work_start: payload.workStart,
      work_end: payload.workEnd,
      work_days: payload.workDays,
      primary_color: payload.primaryColor,
      updated_by: userId,
    };

    const { error: settingsError } = await supabase
      .from('company_settings')
      .upsert(settingsPayload, { onConflict: 'tenant_id' });

    if (settingsError) {
      throw new BadRequestException(
        `Failed to save company settings: ${settingsError.message}`,
      );
    }

    return {
      companyName: payload.companyName,
      workStart: payload.workStart,
      workEnd: payload.workEnd,
      workDays: payload.workDays,
      primaryColor: payload.primaryColor,
      updatedBy: user.email,
    };
  }

  private async getUserTenant(userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('tenant_id, email')
      .eq('id', userId)
      .maybeSingle<UserTenantRow>();

    if (userError) {
      throw new BadRequestException(userError.message);
    }

    if (!user?.tenant_id) {
      throw new NotFoundException('User tenant not found.');
    }

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('id', user.tenant_id)
      .maybeSingle<TenantRow>();

    if (tenantError) {
      throw new BadRequestException(tenantError.message);
    }

    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }

    return { user, tenant };
  }

  private validatePayload(payload: UpsertCompanySettingsDto) {
    if (!payload.companyName?.trim()) {
      throw new BadRequestException('Company name is required.');
    }

    if (
      !/^\d{2}:\d{2}$/.test(payload.workStart) ||
      !/^\d{2}:\d{2}$/.test(payload.workEnd)
    ) {
      throw new BadRequestException('Work start/end must be in HH:MM format.');
    }

    if (!Array.isArray(payload.workDays) || payload.workDays.length === 0) {
      throw new BadRequestException('At least one work day is required.');
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(payload.primaryColor)) {
      throw new BadRequestException('Primary color must be a valid hex value.');
    }
  }
}
