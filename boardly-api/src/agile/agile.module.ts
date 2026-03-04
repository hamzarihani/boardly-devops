import { Module } from '@nestjs/common';
import { AgileService } from './agile.service';
import { AgileController } from './agile.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [AgileService],
  controllers: [AgileController]
})
export class AgileModule {}
