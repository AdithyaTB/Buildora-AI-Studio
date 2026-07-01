const stripe = require('../config/stripe');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Credit = require('../models/Credit');

// Mapping plan types to arbitrary static Price IDs (In a real app, these would come from Stripe Dashboard)
// Since we don't have actual Stripe Price IDs here, we will mock the lines using generic identifiers 
// which the webhook must match against. For a full prod app these would be price_xxxx
const PLAN_PRICES = {
    'pro-monthly': { name: 'Pro Monthly', amount: 49900, credits: 500, priceId: 'price_pro_monthly_placeholder', currency: 'inr' },
    'pro-yearly': { name: 'Pro Yearly', amount: 499900, credits: 8000, priceId: 'price_pro_yearly_placeholder', currency: 'inr' }
};

const CREDIT_PACKS = {
    'credits-199': { name: '₹199 Credit Pack', amount: 19900, credits: 150 }, // Example 150 credits
    'credits-399': { name: '₹399 Credit Pack', amount: 39900, credits: 400 }, // Example 400 credits
    'credits-799': { name: '₹799 Credit Pack', amount: 79900, credits: 1000 } // Example 1000 credits
};

// @desc    Create Stripe Checkout Session
// @route   POST /api/payment/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
    try {
        // Validate Stripe configuration
        if (!process.env.STRIPE_SECRET_KEY || 
            process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder' || 
            process.env.STRIPE_SECRET_KEY.includes('placeholder') || 
            process.env.STRIPE_SECRET_KEY.includes('***')) {
            return res.status(400).json({ 
                message: 'Stripe payment integration is not configured. Please set a valid STRIPE_SECRET_KEY in server/.env file.' 
            });
        }

        const { planType } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const planDetails = PLAN_PRICES[planType];
        const creditPackDetails = CREDIT_PACKS[planType];

        let sessionConfig = {
            payment_method_types: ['card'],
            mode: 'subscription', // Defaults to subscription for monthly/yearly
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/profile?payment=success`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/pricing?payment=cancelled`,
            client_reference_id: req.user.id,
            metadata: {
                userId: req.user.id.toString(),
                planType: planType
            }
        };

        if (planDetails) {
            // Recurring subscription based on the plan mapped
            sessionConfig.line_items = [
                {
                    price_data: {
                        currency: planDetails.currency,
                        product_data: {
                            name: `Buildora AI - ${planDetails.name}`,
                            description: `Includes ${planDetails.credits} credits`,
                        },
                        unit_amount: planDetails.amount,
                        recurring: {
                            interval: planType === 'pro-yearly' ? 'year' : 'month',
                        },
                    },
                    quantity: 1,
                },
            ];
        } else if (creditPackDetails) {
            // Standalone one-time purchase
            sessionConfig.mode = 'payment';
            sessionConfig.line_items = [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Buildora AI - ${creditPackDetails.name}`,
                        },
                        unit_amount: creditPackDetails.amount,
                    },
                    quantity: 1,
                },
            ];
            sessionConfig.metadata.planType = planType;
        } else {
            return res.status(400).json({ message: 'Invalid plan type' });
        }

        // Attach customer ID if it exists previously to avoid creating duplicates in Stripe
        if (user.stripeCustomerId) {
            sessionConfig.customer = user.stripeCustomerId;
        } else {
            sessionConfig.customer_email = user.email;
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        // Record intent as pending
        await Payment.create({
            userId: req.user.id,
            amount: sessionConfig.line_items[0].price_data.unit_amount / 100,
            planType: sessionConfig.metadata.planType,
            status: 'pending',
            razorpayOrderId: session.id // Reusing field name for session id momentarily to avoid breaking Payment schema
        });

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        console.error("Stripe Session Creation Error:", error);
        res.status(500).json({ message: 'Failed to create stripe session' });
    }
};

// @desc    Handle Stripe Webhooks
// @route   POST /api/payment/webhook
// @access  Public (Requires raw body and Stripe Signature)
const stripeWebhook = async (req, res) => {
    const rawBody = req.body;
    const signature = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        // Handle checkout session completed
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata.userId;
            const planType = session.metadata.planType;

            const user = await User.findById(userId);
            if (!user) throw new Error("User not found for webhook processing.");

            // Update user Stripe details
            user.stripeCustomerId = session.customer;
            if (session.subscription) {
                user.stripeSubscriptionId = session.subscription;
            }

            let creditsToAdd = 0;

            if (planType === 'pro-monthly') {
                creditsToAdd = 500;
                user.plan = 'pro-monthly';
                user.isPro = true;
                user.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Approximate 1 month
            } else if (planType === 'pro-yearly') {
                creditsToAdd = 8000;
                user.plan = 'pro-yearly';
                user.isPro = true;
                user.nextBillingDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Approximate 1 year
            } else if (planType === 'credits-199') {
                creditsToAdd = 150;
            } else if (planType === 'credits-399') {
                creditsToAdd = 400;
            } else if (planType === 'credits-799') {
                creditsToAdd = 1000;
            }

            user.credits += creditsToAdd;
            await user.save();

            // Mark Payment record as completed
            const paymentRecord = await Payment.findOne({ razorpayOrderId: session.id });
            if (paymentRecord) {
                paymentRecord.status = 'completed';
                await paymentRecord.save();
            }

            // Log Credit history
            await Credit.create({
                userId: user.id,
                action: 'purchase',
                amount: creditsToAdd,
                description: `Stripe Payment: ${planType}`
            });

            console.log(`Successfully processed payment for user ${userId} on plan ${planType}`);
        }

        // Return a 200 response to acknowledge receipt of the event
        res.status(200).json({ received: true });
    } catch (error) {
        console.error("Error processing Webhook Event:", error);
        res.status(500).json({ error: 'Internal Webhook Processing Handler Error' });
    }
};

module.exports = { createCheckoutSession, stripeWebhook };
