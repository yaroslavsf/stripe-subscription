import { Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { response } from 'express';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  private stripe: Stripe;
  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY')!, {
      // apiVersion: '2024-01-22',
    });
  }
  @HttpCode(200)
  @Get('check')
  public check(): string {
    return 'checked';
  }

  @Post('/create-checkout-session')
  public async createCheckoutSession(
    @Req() req: any,
    @Res() res: any,
  ): Promise<any> {
    const prices = await this.stripe.prices.list({
      lookup_keys: [req.body.lookup_key],
      expand: ['data.product'],
    });

    //TODO: get email from context
    const currentUser = `${this.configService.get('HARDCODED_CONTEXT_EMAIL')!}`;

    const session = await this.stripe.checkout.sessions.create({
      shipping_address_collection: {
        allowed_countries: ['DE'],
      },
      phone_number_collection: {
        enabled: true,
      },
      client_reference_id: currentUser,
      customer_email: currentUser,
      line_items: [
        {
          price: prices.data[0].id,
          // For metered billing, do not pass quantity
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${this.configService.get(
        'FRONTEND_URL',
      )!}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('FRONTEND_URL')!}?canceled=true`,
    });

    res.redirect(303, session.url);
  }

  @Post('/create-portal-session')
  public async createPortalSession(
    @Req() req: any,
    @Res() res: any,
  ): Promise<any> {
    // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
    // Typically this is stored alongside the authenticated user in your database.
    const { session_id } = req.body;
    const checkoutSession = await this.stripe.checkout.sessions.retrieve(
      session_id,
    );

    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const returnUrl = this.configService.get('FRONTEND_URL')!;

    const portalSession = await this.stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer!.toString(),
      return_url: returnUrl,
    });

    res.redirect(303, portalSession.url);
  }

  @Post('/webhook')
  public async webHook(@Req() req: any): Promise<any> {
    let event = req.rawBody;

    // Get the signature sent by Stripe
    const signature = req.headers['stripe-signature'];
    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        this.configService.get('STRIPE_SECRET_KEY')!,
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }

    //TODO: save the data of user on success
    // Handle the event
    let subscription;
    let status;
    // Handle the event
    console.log(event.type);
    // switch (event.type) {
    //   case 'customer.subscription.trial_will_end':
    //     subscription = event.data.object;
    //     status = subscription.status;
    //     console.log(`Subscription status is ${status}.`);
    //     // Then define and call a method to handle the subscription trial ending.
    //     // handleSubscriptionTrialEnding(subscription);
    //     break;
    //   case 'customer.subscription.deleted':
    //     subscription = event.data.object;
    //     status = subscription.status;
    //     console.log(`Subscription status is ${status}.`);
    //     // Then define and call a method to handle the subscription deleted.
    //     // handleSubscriptionDeleted(subscriptionDeleted);
    //     break;
    //   case 'customer.subscription.created':
    //     subscription = event.data.object;
    //     status = subscription.status;
    //     console.log(`Subscription status is ${status}.`);
    //     // Then define and call a method to handle the subscription created.
    //     // handleSubscriptionCreated(subscription);
    //     break;
    //   case 'customer.subscription.updated':
    //     subscription = event.data.object;
    //     status = subscription.status;
    //     console.log(`Subscription status is ${status}.`);
    //     // Then define and call a method to handle the subscription update.
    //     // handleSubscriptionUpdated(subscription);
    //     break;
    //   default:
    //     // Unexpected event type
    //     console.log(`Unhandled event type ${event.type}.`);
    // }
    return response.sendStatus(200);
  }
}
