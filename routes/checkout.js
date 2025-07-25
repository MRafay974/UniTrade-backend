const express = require("express");
const Stripe = require("stripe");
const Order = require("../models/order"); // Your order schema
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Route 1: Create Stripe Checkout Session
// router.post("/create-checkout-session", async (req, res) => {
//   const { product, userId, buyerName, buyerPhone } = req.body;

//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       success_url: "http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}",
//       cancel_url: "http://localhost:5173/payment-cancel",
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: product.name,
//               images: ["https://via.placeholder.com/300"],
//             },
//             unit_amount: product.price * 100,
//           },
//           quantity: 1,
//         },
//       ],
//       metadata: {
//         productId: product._id,
//         amount: product.price,
//         sellerEmail: product.userEmail,
//         userId: userId,
//         buyerName: buyerName,
//         buyerPhone: buyerPhone,
//       },
//     });

//     res.json({ url: session.url });
//   } catch (error) {
//     console.error("Stripe Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

router.post("/create-checkout-session", async (req, res) => {
  const { cartItems, userId, buyerName, buyerPhone, sellerEmail } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: "http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/payment-cancel",
      line_items: JSON.parse(cartItems).map(item => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: ["https://via.placeholder.com/300"]
          },
          unit_amount: item.price * 100
        },
        quantity: item.quantity
      })),
      metadata: {
        cartItems, // Stringified cart array
        userId,
        buyerName,
        buyerPhone,
        sellerEmail
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});




// ✅ Route 2: Stripe Webhook for Payment Confirmation
// router.post("/webhook", async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error("Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;
//     const { productId, amount, sellerEmail, userId, buyerName, buyerPhone } = session.metadata;

//     try {
//       const newOrder = new Order({
//   user: userId, // Required field
//   productId,
//   amount,
//   total: amount, // Or calculate if multiple items
//   sellerEmail,
//   buyer: {
//     name: buyerName || "Stripe Customer",
//     phone: buyerPhone || "N/A",
//   },
//   paymentMethod: "card",
//   pickupLocation: "",
//   status: "paid",
//   stripePaymentId: session.id
// });

//       await newOrder.save();
//       console.log("✅ Order saved successfully:", newOrder);
//     } catch (error) {
//       console.error("❌ Error saving order:", error);
//     }
//   }

//   res.json({ received: true });
// });


router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log("✅ Webhook verified:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // ✅ Extract metadata
    const { cartItems, userId, buyerName, buyerPhone, sellerEmail } = session.metadata;

    let items = [];
    let total = 0;

    try {
      // ✅ Parse cart items
      items = JSON.parse(cartItems); // [{ productId, quantity, price }]
      total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    } catch (err) {
      console.error("❌ Error parsing cart items:", err);
    }

    try {
      const formattedItems = items.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price
      }));

      const newOrder = new Order({
        user: userId,
        items: formattedItems,
        total,
        buyer: {
          name: buyerName || "Stripe Customer",
          phone: buyerPhone || "N/A"
        },
        sellerEmail,
        paymentMethod: "card",
        status: "paid",
        pickupLocation: "",
        stripePaymentId: session.id
      });

      await newOrder.save();
      console.log("✅ Multi-item order saved successfully:", newOrder);
    } catch (error) {
      console.error("❌ Error saving order:", error);
    }
  }

  res.json({ received: true });
});


module.exports = router;
