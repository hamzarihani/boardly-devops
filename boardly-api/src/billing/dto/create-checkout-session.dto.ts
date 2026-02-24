export type BillingPeriod = 'monthly' | 'yearly';
export type PlanId = 'freelancer' | 'startup' | 'enterprise';

export class CreateCheckoutSessionDto {
  planId!: PlanId;
  billingPeriod!: BillingPeriod;
}
