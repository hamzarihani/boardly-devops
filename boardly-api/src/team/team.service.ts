import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateTeamMemberDto, TeamRole } from './create-team-member.dto';
import { UpdateTeamMemberDto } from './update-team-member.dto';

interface UserTenantRow {
  id: string;
  tenant_id: string;
  email: string;
  role: TeamRole;
}

interface TeamMemberRow {
  id: string;
  full_name?: string | null;
  email: string;
  role: TeamRole;
  created_at: string;
}

@Injectable()
export class TeamService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getMembers(userId: string) {
    const { tenantId } = await this.getUserTenant(userId);
    return this.listMembersByTenant(tenantId);
  }

  async createMember(userId: string, payload: CreateTeamMemberDto) {
    this.validateName(payload.name);
    this.validateEmail(payload.email);
    this.validateRole(payload.role);

    const { tenantId } = await this.getUserTenant(userId);
    const supabase = this.supabaseService.getClient();

    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('email', payload.email)
      .maybeSingle<{ id: string }>();

    if (existingUserError) {
      throw new BadRequestException(existingUserError.message);
    }

    if (existingUser) {
      throw new BadRequestException(
        'A team member with this email already exists.',
      );
    }

    const randomPassword = `Boardly!${Math.random().toString(36).slice(2, 10)}A1`;
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: payload.email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: { full_name: payload.name },
      });

    if (authError || !authUser.user) {
      throw new BadRequestException(
        authError?.message || 'Failed to create auth user.',
      );
    }

    const { error: insertError } = await supabase.from('users').insert({
      id: authUser.user.id,
      tenant_id: tenantId,
      full_name: payload.name,
      email: payload.email,
      role: payload.role,
    });

    if (insertError && this.isMissingFullNameColumnError(insertError)) {
      const { error: fallbackInsertError } = await supabase.from('users').insert({
        id: authUser.user.id,
        tenant_id: tenantId,
        email: payload.email,
        role: payload.role,
      });

      if (fallbackInsertError) {
        await supabase.auth.admin.deleteUser(authUser.user.id);
        throw new BadRequestException(fallbackInsertError.message);
      }
    } else if (insertError) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new BadRequestException(insertError.message);
    }

    return {
      id: authUser.user.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      temporaryPassword: randomPassword,
    };
  }

  async updateMember(
    userId: string,
    memberId: string,
    payload: UpdateTeamMemberDto,
  ) {
    this.validateName(payload.name);
    this.validateEmail(payload.email);
    this.validateRole(payload.role);

    const { tenantId } = await this.getUserTenant(userId);
    const supabase = this.supabaseService.getClient();

    const member = await this.getMemberByIdAndTenant(memberId, tenantId);

    const { data: duplicate, error: duplicateError } = await supabase
      .from('users')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('email', payload.email)
      .neq('id', memberId)
      .maybeSingle<{ id: string }>();

    if (duplicateError) {
      throw new BadRequestException(duplicateError.message);
    }

    if (duplicate) {
      throw new BadRequestException(
        'A team member with this email already exists.',
      );
    }

    if (member.email !== payload.email) {
      const { error: authUpdateError } =
        await supabase.auth.admin.updateUserById(memberId, {
          email: payload.email,
          email_confirm: true,
        });
      if (authUpdateError) {
        throw new BadRequestException(authUpdateError.message);
      }
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        full_name: payload.name,
        email: payload.email,
        role: payload.role,
      })
      .eq('id', memberId)
      .eq('tenant_id', tenantId);

    if (updateError && this.isMissingFullNameColumnError(updateError)) {
      const { error: fallbackUpdateError } = await supabase
        .from('users')
        .update({
          email: payload.email,
          role: payload.role,
        })
        .eq('id', memberId)
        .eq('tenant_id', tenantId);

      if (fallbackUpdateError) {
        throw new BadRequestException(fallbackUpdateError.message);
      }
    } else if (updateError) {
      throw new BadRequestException(updateError.message);
    }

    return {
      id: memberId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      status: 'ACTIVE' as const,
      createdAt: member.created_at,
    };
  }

  async deleteMember(userId: string, memberId: string) {
    const { tenantId, currentUser } = await this.getUserTenant(userId);
    const supabase = this.supabaseService.getClient();

    const member = await this.getMemberByIdAndTenant(memberId, tenantId);
    if (member.id === currentUser.id) {
      throw new ForbiddenException('You cannot delete your own account.');
    }

    const { error: authDeleteError } =
      await supabase.auth.admin.deleteUser(memberId);
    if (authDeleteError) {
      throw new BadRequestException(authDeleteError.message);
    }

    return { ok: true };
  }

  private async listMembersByTenant(tenantId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: membersWithName, error: membersWithNameError } = await supabase
      .from('users')
      .select('id, full_name, email, role, created_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .returns<TeamMemberRow[]>();

    if (membersWithNameError && !this.isMissingFullNameColumnError(membersWithNameError)) {
      throw new BadRequestException(membersWithNameError.message);
    }

    let members: TeamMemberRow[] | null = membersWithName;
    if (membersWithNameError && this.isMissingFullNameColumnError(membersWithNameError)) {
      const { data: fallbackMembers, error: fallbackMembersError } = await supabase
        .from('users')
        .select('id, email, role, created_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .returns<TeamMemberRow[]>();

      if (fallbackMembersError) {
        throw new BadRequestException(fallbackMembersError.message);
      }
      members = fallbackMembers;
    }

    return (members ?? []).map((member) => ({
      id: member.id,
      email: member.email,
      name: member.full_name || this.buildNameFromEmail(member.email),
      role: member.role,
      status: 'ACTIVE' as const,
      createdAt: member.created_at,
    }));
  }

  private async getUserTenant(userId: string) {
    const supabase = this.supabaseService.getClient();
    const { data: currentUser, error: currentUserError } = await supabase
      .from('users')
      .select('id, tenant_id, email, role')
      .eq('id', userId)
      .maybeSingle<UserTenantRow>();

    if (currentUserError) {
      throw new BadRequestException(currentUserError.message);
    }

    if (!currentUser?.tenant_id) {
      throw new NotFoundException('User tenant not found.');
    }

    return { tenantId: currentUser.tenant_id, currentUser };
  }

  private async getMemberByIdAndTenant(memberId: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    const { data: memberWithName, error: memberWithNameError } = await supabase
      .from('users')
      .select('id, full_name, email, role, created_at')
      .eq('id', memberId)
      .eq('tenant_id', tenantId)
      .maybeSingle<TeamMemberRow>();

    if (memberWithNameError && !this.isMissingFullNameColumnError(memberWithNameError)) {
      throw new BadRequestException(memberWithNameError.message);
    }

    let member: TeamMemberRow | null = memberWithName;
    if (memberWithNameError && this.isMissingFullNameColumnError(memberWithNameError)) {
      const { data: fallbackMember, error: fallbackMemberError } = await supabase
        .from('users')
        .select('id, email, role, created_at')
        .eq('id', memberId)
        .eq('tenant_id', tenantId)
        .maybeSingle<TeamMemberRow>();

      if (fallbackMemberError) {
        throw new BadRequestException(fallbackMemberError.message);
      }
      member = fallbackMember;
    }

    if (!member) {
      throw new NotFoundException('Team member not found.');
    }

    return member;
  }

  private validateRole(role: TeamRole) {
    if (role !== 'ADMIN' && role !== 'MEMBER') {
      throw new BadRequestException('Role must be ADMIN or MEMBER.');
    }
  }

  private validateName(name: string) {
    if (!name || !name.trim()) {
      throw new BadRequestException('Name is required.');
    }
  }

  private validateEmail(email: string) {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new BadRequestException('Email format is invalid.');
    }
  }

  private isMissingFullNameColumnError(error: { message?: string }) {
    const message = error.message?.toLowerCase() ?? '';
    return (
      message.includes('column users.full_name does not exist') ||
      (message.includes('full_name') && message.includes('does not exist'))
    );
  }

  private buildNameFromEmail(email: string) {
    const localPart = email.split('@')[0] ?? email;
    return localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
