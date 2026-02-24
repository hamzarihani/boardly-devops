import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { BillingPeriod, PlanId } from './dto/create-checkout-session.dto';

export interface BillingPlan {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlySavingsLabel: string;
  description: string;
  seats: string;
  storage: string;
  apiCalls: string;
  supportSla: string;
  highlight?: boolean;
  ctaLabel?: string;
  features: string[];
}

type BillingStatus = 'Paid' | 'Pending' | 'Failed';

export interface BillingInvoice {
  id: string;
  date: string;
  plan: string;
  amount: number;
  status: BillingStatus;
  method: string;
}

export interface CurrentSubscription {
  planId: PlanId;
  startedAt: string;
  expiredAt: string;
  billingPeriod: BillingPeriod;
}

interface BillingState {
  subscription: CurrentSubscription;
  invoices: BillingInvoice[];
}

const BILLING_PLANS: BillingPlan[] = [
  {
    id: 'freelancer',
    name: 'Freelancer',
    monthlyPrice: 19,
    yearlyPrice: 190,
    yearlySavingsLabel: 'Save $38 yearly',
    description:
      'Ideal for consultants and solo operators running client projects.',
    seats: '1 seat included',
    storage: '50 GB storage',
    apiCalls: '20k API calls / month',
    supportSla: 'Email support (48h SLA)',
    ctaLabel: 'Start Freelancer',
    features: [
      'Unlimited personal boards',
      'Custom fields',
      'Invoice-ready time tracking',
    ],
  },
  {
    id: 'startup',
    name: 'Startup',
    monthlyPrice: 79,
    yearlyPrice: 790,
    yearlySavingsLabel: 'Save $158 yearly',
    description:
      'Best for product teams scaling delivery with agile and automation.',
    seats: 'Up to 15 seats',
    storage: '500 GB storage',
    apiCalls: '250k API calls / month',
    supportSla: 'Priority support (8h SLA)',
    highlight: true,
    ctaLabel: 'Upgrade to Startup',
    features: [
      'Sprint planning + burndown',
      'Advanced roles and permissions',
      'Slack + GitHub integrations',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 249,
    yearlyPrice: 2490,
    yearlySavingsLabel: 'Save $498 yearly',
    description:
      'For large organizations with strict security, compliance, and governance.',
    seats: 'Unlimited seats',
    storage: 'Unlimited storage',
    apiCalls: 'Unlimited API calls',
    supportSla: 'Dedicated CSM + 1h critical SLA',
    ctaLabel: 'Contact Sales',
    features: [
      'SSO/SAML + SCIM provisioning',
      'Audit logs + compliance exports',
      'Custom onboarding and migration',
    ],
  },
];

@Injectable()
export class BillingService {
  private readonly states = new Map<string, BillingState>();

  getOverview(userId: string) {
    const state = this.getOrCreateState(userId);

    return {
      plans: BILLING_PLANS,
      currentSubscription: state.subscription,
      history: state.invoices.sort((a, b) => (a.date < b.date ? 1 : -1)),
    };
  }

  async createCheckoutSession(
    userId: string,
    planId: PlanId,
    billingPeriod: BillingPeriod,
  ) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new BadRequestException(
        'Stripe is not configured. Missing STRIPE_SECRET_KEY.',
      );
    }

    const plan = BILLING_PLANS.find((item) => item.id === planId);
    if (!plan) {
      throw new BadRequestException('Invalid plan selected.');
    }

    if (billingPeriod !== 'monthly' && billingPeriod !== 'yearly') {
      throw new BadRequestException('Invalid billing period.');
    }

    const frontendBaseUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const amount =
      billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const interval = billingPeriod === 'monthly' ? 'month' : 'year';

    const body = new URLSearchParams();
    body.append('mode', 'subscription');
    body.append(
      'success_url',
      `${frontendBaseUrl}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    );
    body.append('cancel_url', `${frontendBaseUrl}/billing?checkout=cancel`);
    body.append('line_items[0][quantity]', '1');
    body.append('line_items[0][price_data][currency]', 'usd');
    body.append('line_items[0][price_data][unit_amount]', String(amount * 100));
    body.append('line_items[0][price_data][recurring][interval]', interval);
    body.append(
      'line_items[0][price_data][product_data][name]',
      `${plan.name} (${billingPeriod})`,
    );
    body.append('metadata[userId]', userId);
    body.append('metadata[planId]', planId);
    body.append('metadata[billingPeriod]', billingPeriod);

    const response = await fetch(
      'https://api.stripe.com/v1/checkout/sessions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      },
    );

    const payload = (await response.json()) as {
      id?: string;
      url?: string;
      error?: { message?: string };
    };

    if (!response.ok || !payload.url || !payload.id) {
      throw new InternalServerErrorException(
        payload.error?.message ?? 'Failed to create Stripe checkout session.',
      );
    }

    return {
      checkoutUrl: payload.url,
      sessionId: payload.id,
    };
  }

  async confirmCheckout(userId: string, sessionId: string) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new BadRequestException(
        'Stripe is not configured. Missing STRIPE_SECRET_KEY.',
      );
    }

    if (!sessionId) {
      throw new BadRequestException('Missing checkout session ID.');
    }

    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
        },
      },
    );

    const payload = (await response.json()) as {
      metadata?: Record<string, string>;
      payment_status?: string;
      id?: string;
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new InternalServerErrorException(
        payload.error?.message ?? 'Failed to verify Stripe checkout session.',
      );
    }

    if (payload.payment_status !== 'paid') {
      throw new BadRequestException('Checkout session is not paid yet.');
    }

    const selectedPlanId = payload.metadata?.planId as PlanId | undefined;
    const selectedBillingPeriod = payload.metadata?.billingPeriod as
      | BillingPeriod
      | undefined;

    if (!selectedPlanId || !selectedBillingPeriod) {
      throw new BadRequestException('Stripe session metadata is incomplete.');
    }

    const plan = BILLING_PLANS.find((item) => item.id === selectedPlanId);
    if (!plan) {
      throw new BadRequestException('Invalid plan in Stripe session metadata.');
    }

    const now = new Date();
    const expiresAt = new Date(now);
    if (selectedBillingPeriod === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    const state = this.getOrCreateState(userId);
    state.subscription = {
      planId: selectedPlanId,
      billingPeriod: selectedBillingPeriod,
      startedAt: this.toDate(now),
      expiredAt: this.toDate(expiresAt),
    };

    const amount =
      selectedBillingPeriod === 'monthly'
        ? plan.monthlyPrice
        : plan.yearlyPrice;

    state.invoices = [
      {
        id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        date: this.toDate(now),
        plan: plan.name,
        amount,
        status: 'Paid',
        method: 'Stripe Checkout',
      },
      ...state.invoices,
    ];

    return {
      ok: true,
      currentSubscription: state.subscription,
    };
  }

  private getOrCreateState(userId: string) {
    const existing = this.states.get(userId);
    if (existing) return existing;

    const now = new Date();
    const startedAt = new Date(now);
    startedAt.setMonth(startedAt.getMonth() - 1);
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 2);

    const seedState: BillingState = {
      subscription: {
        planId: 'startup',
        billingPeriod: 'monthly',
        startedAt: this.toDate(startedAt),
        expiredAt: this.toDate(expiresAt),
      },
      invoices: [
        {
          id: 'INV-1024',
          date: this.toDate(now),
          plan: 'Startup',
          amount: 79,
          status: 'Pending',
          method: 'Stripe Checkout',
        },
        {
          id: 'INV-1023',
          date: this.toDate(new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000)),
          plan: 'Startup',
          amount: 79,
          status: 'Paid',
          method: 'Visa **** 4242',
        },
        {
          id: 'INV-1022',
          date: this.toDate(new Date(now.getTime() - 62 * 24 * 60 * 60 * 1000)),
          plan: 'Startup',
          amount: 79,
          status: 'Paid',
          method: 'Visa **** 4242',
        },
      ],
    };

    this.states.set(userId, seedState);
    return seedState;
  }

  private toDate(value: Date) {
    return value.toISOString().slice(0, 10);
  }
}
