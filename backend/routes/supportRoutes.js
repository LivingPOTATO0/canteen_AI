const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const Order = require('../models/Order');
const Vendor = require('../models/Vendor');
const { Op } = require('sequelize');

router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        // 1. Check for Token Number in message (e.g., "9933", "#9933", "Token 1234")
        const tokenMatch = message.match(/(?:#|Token\s?|Order\s?)?(\d{4})/i);
        let orderContext = "";

        if (tokenMatch) {
            const rawToken = tokenMatch[1]; // Captured digits: "9933"
            
            // Try matching both "9933" and "#9933" formats to be robust
            const possibleTokens = [rawToken, `#${rawToken}`];
            
            const order = await Order.findOne({ 
                where: { 
                    token: { [Op.in]: possibleTokens } 
                },
                include: [{ model: Vendor, attributes: ['name'] }]
            });
            
            if (order) {
                orderContext = `\n[SYSTEM INFO]: Found Order ${order.token} from ${order.Vendor?.name}. Status: ${order.status.toUpperCase()}. Total: ₹${order.total_price}. Predicted Pickup: ${new Date(order.predicted_pickup_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.`;
            } else {
                orderContext = `\n[SYSTEM INFO]: User mentioned token ${rawToken} but no order was found. Ask them to check if it's correct.`;
            }
        }

        // Construct system prompt
        const systemPrompt = `You are the AI Assistant for "Tomato", a campus canteen app. 
        Your goal is to help students with their orders, app navigation, and general food queries.
        Tone: Friendly, helpful, concise, and using food puns occasionally.
        
        FORMATTING INSTRUCTIONS:
        - Do NOT use Markdown tables. Ideally use bullet points or numbered lists.
        - Keep responses short and easy to read on mobile.
        - Use bold text for emphasis (e.g., **Order Status**).
        
        Knowledge Base:
        - Students can order food from multiple vendors (Gourmet Express, Juice Bar, Pizza Hut, Subway, Starbucks).
        - Orders have status: Pending -> Preparing -> Ready.
        - Students get a token number.
        
        ${orderContext}
        
        INSTRUCTIONS:
        - If [SYSTEM INFO] provides order details, repeat them clearly to the user.
        - If [SYSTEM INFO] says order not found, politely ask them to double-check the token.
        - If no token was mentioned, answer generally.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...(history || []),
            { role: 'user', content: message }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: 'llama-3.3-70b-versatile', // Switching to Llama 3 for reliability
            temperature: 0.7,
            max_tokens: 300,
        });

        res.json({ reply: chatCompletion.choices[0]?.message?.content || "I'm having trouble connecting to the kitchen. Try again!" });

    } catch (error) {
        console.error('Support Chat Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

module.exports = router;
