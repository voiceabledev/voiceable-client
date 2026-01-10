/**
 * Knowledge base for the Setup Assistant ChatGPT integration
 * Contains comprehensive information about Voiceable products, setup process,
 * integrations, phone purchasing, pricing, and common questions.
 */

export const SETUP_ASSISTANT_KNOWLEDGE = `
# Voiceable Setup Assistant Knowledge Base

## Product Overview

Voiceable is an AI-powered voice assistant platform that allows you to create, configure, and manage AI voice agents for phone calls, customer support, lead generation, and more.

### Key Features
- **AI Voice Agents**: Create intelligent voice assistants powered by advanced AI models (GPT-4, Claude, Gemini, etc.)
- **Natural Conversations**: Agents can handle natural conversations with customers
- **Integration Capabilities**: Connect with CRM systems, scheduling tools, and other business applications
- **Customizable Behavior**: Configure agent behavior, scenarios, phases, and voice tone
- **Call Outcomes**: Track and manage call outcomes and escalation rules
- **Phone Numbers**: Purchase and manage phone numbers for your agents
- **Web Widget**: Embed chat widgets on your website

## Setup Process

### Wizard Steps Overview

The setup wizard consists of 6 steps:

1. **Template & Name (Step 0)**
   - Select a template for your agent (Customer Support, Lead Generation, Sales, etc.)
   - Enter a name for your agent
   - Templates come with pre-configured behavior, scenarios, and settings

2. **Model Selection (Step 1)**
   - Choose an AI provider (OpenAI, Anthropic, Google, ElevenLabs, etc.)
   - Select a specific model (GPT-4o, Claude Sonnet, Gemini, etc.)
   - Different models have different capabilities and pricing

3. **Voice & Language (Step 2)**
   - Select voice(s) for your agent
   - Choose language(s) the agent will speak
   - Preview voices before selecting

4. **Call Outcomes (Step 3)**
   - Define what constitutes a successful call
   - Set up escalation rules
   - Configure when to transfer to human agents

5. **Agent Behaviour (Step 4)**
   - Configure scenarios (common conversation situations)
   - Set up phases (greeting, information gathering, closing, etc.)
   - Define voice tone and personality
   - Customize system prompts

6. **Integrations (Step 5)**
   - Interactive guided setup process
   - The assistant will ask you about integrations step-by-step:
     1. First, you'll be asked if you want to integrate a CRM System
        - Available options: Pipedrive, HubSpot, Kommo
        - After selecting, a modal will open for you to connect your credentials or OAuth
     2. After CRM setup (or if you skip), you'll be asked about scheduling tools
        - Available options: Cal.com, Calendly, Google Calendar
        - After selecting, a modal will open for connection
     3. Finally, you'll be asked if you'd like to recommend additional tools
   - You can connect multiple integrations
   - All integrations can be configured later if skipped during setup

### Best Practices
- Start with a template that matches your use case
- Use GPT-4o or Claude Sonnet for best conversation quality
- Test your voice selection before finalizing
- Configure clear call outcomes for better tracking
- Connect integrations early to avoid reconfiguration

## Integrations

### Available Integration Types

#### CRM Systems
- **HubSpot**: Sync contacts, deals, and activities
- **Salesforce**: Manage leads and opportunities
- **Pipedrive**: Track sales pipeline

#### Scheduling Tools
- **Cal.com**: Open-source scheduling platform
- **Calendly**: Popular scheduling solution
- **Google Calendar**: Direct calendar integration

#### Other Integrations
- **Twilio**: Phone number management and calling
- **Webhooks**: Custom API integrations
- **Custom Tools**: Build your own integration tools

### Setting Up Integrations

During step 5, the setup assistant will guide you through integration setup interactively:

1. The assistant will ask if you want to integrate a CRM System
   - Answer "Yes" or "No"
   - If Yes, you'll see available CRM options (Pipedrive, HubSpot, Kommo)
   - Select your preferred CRM
   - A connection modal will open automatically
   - Follow the OAuth flow or enter API credentials in the modal
   - The assistant will detect when the connection is complete

2. After CRM setup (or if you skip), the assistant will ask about scheduling tools
   - Answer "Yes" or "No"
   - If Yes, you'll see available scheduling options (Cal.com, Calendly, Google Calendar)
   - Select your preferred scheduling tool
   - A connection modal will open automatically
   - Complete the connection process

3. Finally, the assistant will ask if you'd like to recommend additional tools

You can also set up integrations manually later by clicking "Add Integration" in the integrations section.

### Integration Tools

Each integration provides specific tools/actions:
- **HubSpot**: Create contacts, update deals, log activities
- **Salesforce**: Create leads, update opportunities
- **Scheduling**: Check availability, create bookings
- **Webhooks**: Trigger custom actions via API calls

## Phone Numbers

### Purchasing Phone Numbers

1. Navigate to Settings > Phone Numbers
2. Click "Buy Phone Number"
3. Select country and region
4. Choose number type (local, toll-free, etc.)
5. Complete purchase (billed monthly)

### Phone Number Features
- Local and toll-free numbers available
- Automatic call routing to your agent
- Call recording and analytics
- SMS capabilities (where supported)

### Pricing
- Phone numbers are billed monthly
- Pricing varies by country and number type
- Check the pricing page for current rates

## Pricing

### Agent Pricing
- Free tier: Limited agents and features
- Pro tier: Full features, more agents
- Enterprise: Custom pricing and features

### Usage-Based Costs
- **AI Model Usage**: Charged per API call to the AI provider
- **Phone Calls**: Charged per minute
- **Phone Numbers**: Monthly subscription per number

### Cost Optimization Tips
- Use GPT-4o-mini for simple conversations to save costs
- Monitor usage in the dashboard
- Set up call limits if needed
- Use appropriate models for your use case

## Common Questions

### Setup Questions

**Q: Which template should I choose?**
A: Choose based on your primary use case:
- Customer Support: For handling customer inquiries
- Lead Generation: For qualifying and capturing leads
- Sales: For product presentations and closing deals
- Appointment Booking: For scheduling appointments

**Q: What's the difference between models?**
A: 
- GPT-4o: Best overall quality, good for complex conversations
- GPT-4o-mini: Faster and cheaper, good for simple tasks
- Claude Sonnet: Excellent for nuanced conversations
- Gemini: Good balance of quality and speed

**Q: Can I change settings later?**
A: Yes! All settings can be modified after creation in the agent detail page.

**Q: How do I test my agent?**
A: Use the voice preview feature in the Voice & Language step, or use the test call feature after creation.

### Integration Questions

**Q: Do I need to connect integrations during setup?**
A: No, you can skip and add them later. However, it's easier to set them up during initial configuration.

**Q: What if my integration isn't listed?**
A: You can use webhooks to connect to any API. Check the webhooks documentation for details.

**Q: Can I use multiple integrations?**
A: Yes! You can connect multiple CRM systems, scheduling tools, etc.

### Phone Number Questions

**Q: Do I need a phone number to test?**
A: No, you can test using the web widget or test call feature without a phone number.

**Q: Can I port my existing number?**
A: Yes, contact support for number porting assistance.

**Q: What countries are supported?**
A: Check the phone numbers page for current country availability.

### Behavior Questions

**Q: How do I customize what my agent says?**
A: Use the Agent Behaviour step to configure scenarios, phases, and system prompts.

**Q: Can I make my agent more friendly/formal?**
A: Yes, adjust the voice tone settings in the Agent Behaviour step.

**Q: What are scenarios and phases?**
A: 
- Scenarios: Common situations your agent will encounter
- Phases: Stages of a conversation (greeting, information gathering, closing)

## Troubleshooting

### Common Issues

**Issue: Agent not responding correctly**
- Check the system prompt in Agent Behaviour
- Verify the model selection
- Review scenarios and phases

**Issue: Integration not working**
- Verify API credentials are correct
- Check integration connection status
- Review webhook tool configuration

**Issue: Phone call not connecting**
- Verify phone number is active
- Check agent is published
- Review call routing settings

## Action Guidelines

When helping users set up their agent, you can perform the following actions:

1. **Navigate Steps**: Move to specific wizard steps (0-5)
2. **Fill Fields**: Enter values in form fields (name, prompts, etc.)
3. **Click Buttons**: Click Next, Save, Select template, etc.
4. **Select Options**: Choose from dropdowns, checkboxes, radio buttons

Always wait for user confirmation before performing actions, unless the user explicitly asks you to proceed.

## Response Format

When responding to users:
- Be helpful and friendly
- Explain what you're doing before doing it
- Ask for confirmation before major actions
- Provide context about why certain steps are important
- Answer questions using the knowledge base above
`;
