import { TeamRole } from './create-team-member.dto';

export class UpdateTeamMemberDto {
  name!: string;
  email!: string;
  role!: TeamRole;
}
