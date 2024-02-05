## About
User wants to subscribe to one of monthly billed
subscriptions. The stripe provides
you with pre-built payment pages such as
checkout(when you subscribe) or portal(when you delete/update subscription).
So Stripe persists information about order/customer/subscription on
their servers.

If Stripe does payment with prebuilt page and data saves on their side, how
does my App synchronize the data? It would be such a waste to call Stripe API each time,
when my App needs to check when the subscription ends or what kind of feature
user has.

Stripe can provide you with info about the payment via "Webhook" endpoint. Each request
to this endpoint is an event like "Payment is successful" or "Card is declined".

<b>Small presentation</b>:
./stripe.pptx
<br>
  

<details>
  <summary>Problems</summary>
  Customer email is not unique in Stripe. So one customer can subscribe to many 
  subscriptions. Since on "Checkout" and "Portal" pages you can enter email
  for payment, the following problems start to raise in pre-built pages:

1) Checkout page:
    1. You can enter any email => email divergence (pre-population).
    2. Backend can generate checkout session with
       the email from auth context, so the frontend can pre-populate the form with email.
       But if there is "Google pay", there you can choose any google account => email divergence
       (turn off google/apple/link payments)
2) Portal page:
    1. You can enter the email that you possess, but if someone entered your email
       in checkout session => they overwrite your subscription (verify email)
    2. Backend can generate portal session only after checkout
       redirection => only after checkout (verify email)
   3. If email doesn't belongs to you => can't enter portal page, cancel only
   via bank (verify email)

<b>Solution:</b> Configure constraint on 1 subscription per customer in
Stripe Dashboard. Pre-populate emails in pre-build pages (unique constraint).
Verify email when register. Turn off google/apple/link payments


</details>

<details>
  <summary>Data flow</summary>

![alt text](/data_flow.png)
</details>
<details>
  <summary>Webhook events</summary>

### Subscribe
1. customer.created
2. payment_intent.created
3. customer.updated
4. invoice.created
5. invoice.finalized
6. customer.subscription.created
7. charge.succeeded
8. payment_intent.succeeded
9. payment_method.attached
10. invoice.updated
11. invoice.paid
12. invoice.payment_succeeded
13. customer.subscription.updated
14. checkout.session.completed

### Update subscription
1. billing_portal.session.created
2. customer.subscription.updated

### Delete subscription
1. billing_portal.session.created
2. customer.subscription.deleted
3. customer.subscription.updated

</details>



## Development

./backend and ./frontend contain their README.md

<details>
  <summary>Guide</summary>

https://stripe.com/docs/billing/quickstart
</details>

<details>
  <summary>Payment imitation</summary>

Logs: <a href="https://dashboard.stripe.com/test/events?related_object=cus_PTAnGWeoBz4Sti">example<a/>
1. login to stripe CLI
2. start listening webhook endpoint in 1st Terminal
3. send fake payment in 2nd Terminal

```bash
stripe login #1
stripe listen --forward-to localhost:8080/api/payments/webhook #2
stripe trigger payment_intent.succeeded #3
```
</details>


