import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { TeamService } from './team.service';
import { CreateTeamMemberDto } from './create-team-member.dto';
import { UpdateTeamMemberDto } from './update-team-member.dto';

interface AuthenticatedRequest {
  user: {
    id: string;
  };
}

@UseGuards(AuthGuard)
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('members')
  getMembers(@Req() req: AuthenticatedRequest) {
    return this.teamService.getMembers(req.user.id);
  }

  @Post('members')
  createMember(
    @Req() req: AuthenticatedRequest,
    @Body() payload: CreateTeamMemberDto,
  ) {
    return this.teamService.createMember(req.user.id, payload);
  }

  @Put('members/:id')
  updateMember(
    @Req() req: AuthenticatedRequest,
    @Param('id') memberId: string,
    @Body() payload: UpdateTeamMemberDto,
  ) {
    return this.teamService.updateMember(req.user.id, memberId, payload);
  }

  @Delete('members/:id')
  deleteMember(
    @Req() req: AuthenticatedRequest,
    @Param('id') memberId: string,
  ) {
    return this.teamService.deleteMember(req.user.id, memberId);
  }
}
