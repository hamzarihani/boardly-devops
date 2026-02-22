import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private clientInstance: SupabaseClient;

  constructor(private configService: ConfigService) {}

  getClient() {
    if (this.clientInstance) {
      return this.clientInstance;
    }

    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-url') {
      const errorMsg = 'Supabase credentials are not configured properly';
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    this.clientInstance = createClient(supabaseUrl, supabaseKey);
    return this.clientInstance;
  }
}
