# 2. Problem Statement

## The situation today

Buying sports equipment in a small or mid-sized Indian town works roughly like
this. The customer walks to a local sports shop, asks what is available, is
shown the two or three options the owner happens to stock, is quoted a price
with no published reference to compare it against, pays in cash, and leaves
with no record of the purchase beyond a handwritten slip.

That process has a number of specific failures.

### For the customer

1. **Limited choice.** A physical shop stocks what fits in the shop. A player
   looking for a particular brand, weight or grade usually cannot find it.
2. **No price transparency.** With no listed price the customer cannot tell
   whether the quote is fair, and cannot compare shops without physically
   visiting each one.
3. **No product information.** There are no specifications, no sizing guidance
   and no independent opinion. The only information available is the shop
   owner's, and the shop owner is also the seller.
4. **No purchase history.** Nothing records what was bought, at what price, or
   when — which matters for warranty claims and for reordering consumables
   such as shuttlecocks and grips.
5. **Travel cost.** Reaching a well-stocked sports shop can mean a journey to a
   larger town, which is a real cost in time and money for a small purchase.

### For the shop owner

1. **Stock is tracked on paper**, so overselling and dead stock are both
   common, and neither is visible until it has already caused a problem.
2. **Reach is limited to walking distance.** The shop cannot sell to anyone who
   does not physically come in.
3. **There is no sales data.** The owner cannot see which products sell, which
   sit, or what the month's revenue actually was, so purchasing decisions are
   guesswork.
4. **Order handling is manual.** Phone orders are written down, and are lost or
   confused as often as not.

## Why existing options do not solve it

Large general marketplaces do sell sports goods, but they are built for scale,
not for a single store: a local retailer cannot control the catalogue,
presentation or pricing, pays a significant commission, and has no direct
relationship with the buyer. At the other end, ready-made shopping-cart
software is either expensive, heavily branded, or so generic that it cannot
model the things that matter in this domain — sizes, grades, sport-specific
categories.

## Problem definition

> Design and implement a secure, responsive, full-stack web application that
> allows a sports retailer to publish a catalogue online and manage stock and
> orders from a single administrative interface, while allowing customers to
> search, compare, review and purchase products, pay by cash on delivery or
> online, and track every order through to delivery — with all business rules
> enforced on the server so that they cannot be bypassed from the browser.

## Constraints the solution must respect

| Constraint | Why it matters |
|---|---|
| Stock must never go negative | Overselling produces orders the shop cannot fulfil |
| Passwords must never be recoverable | A database leak must not expose customer credentials |
| Admin functions must be server-guarded | Hiding a button in the UI is not access control |
| The interface must work on a phone | Most Indian e-commerce traffic is mobile |
| It must run offline on a college machine | The project has to be demonstrable without internet |
| It must use only free, open technology | No licence budget is available for a student project |
