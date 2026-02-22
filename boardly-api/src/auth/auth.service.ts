import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async signup(email: string, password: string, companyName: string) {
    const supabase = this.supabaseService.getClient();

    // 1. Create a tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert([{ name: companyName }])
      .select()
      .single();

    if (tenantError) {
      throw new BadRequestException(`Failed to create tenant: ${tenantError.message}`);
    }

    // 2. Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
        },
      },
    });

    if (authError || !authData.user) {
      // Rollback tenant creation? In a real app, maybe.
      await supabase.from('tenants').delete().eq('id', tenant.id);
      throw new BadRequestException(`Failed to sign up user: ${authError?.message}`);
    }

    // 3. Create user user as ADMIN for this tenant
    const { error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          tenant_id: tenant.id,
          role: 'ADMIN',
          email: email,
        },
      ]);

    if (userError) {
      // Rollback auth and tenant?
      // Supabase doesn't easily support deleting auth users via client without admin privileges
      throw new BadRequestException(`Failed to create user user: ${userError.message}`);
    }

    return {
      user: authData.user,
      tenant,
    };
  }

  async login(email: string, password: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return data;
  }
}
