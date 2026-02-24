import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { BillingService } from './billing.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

interface AuthenticatedRequest {
  user: {
    id: string;
  };
}

@UseGuards(AuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('overview')
  getOverview(@Req() req: AuthenticatedRequest) {
    return this.billingService.getOverview(req.user.id);
  }

  @Post('checkout-session')
  createCheckoutSession(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateCheckoutSessionDto,
  ) {
    return this.billingService.createCheckoutSession(
      req.user.id,
      body.planId,
      body.billingPeriod,
    );
  }

  @Post('checkout-confirm')
  checkoutConfirm(
    @Req() req: AuthenticatedRequest,
    @Body('sessionId') sessionId: string,
  ) {
    return this.billingService.confirmCheckout(req.user.id, sessionId);
  }
}
