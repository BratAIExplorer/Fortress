export const meta = {
  name: 'fortress-cxo-product-review',
  description: 'C-suite product review across investor personas, UI/UX, features, and workflows',
  phases: [
    { title: 'Discovery', detail: 'Map current state against investor personas' },
    { title: 'Analysis', detail: 'Multi-lens review: CCO + PO + PM insights' },
    { title: 'Synthesis', detail: 'Honest feedback & recommendations' },
  ],
}

phase('Discovery')

// Agent 1: Current product state & investor persona mapping
const productState = await agent(
  `Map Fortress Intelligence current features against investor personas:
  
  CURRENT STATE (from CLAUDE.md):
  - Investment Genie: Multi-market allocation form (3-step wizard)
  - Fortress 30: Risk-based stock screening (NSE + US)
  - Portfolio Tracker: Strategy tracking + rebalance alerts
  - Auth: NextAuth (email/OAuth)
  - Markets: NSE India + US stocks live
  - UI: Dark Luxury theme, fully responsive
  
  TASK: 
  1. List all features currently shipped
  2. Map each feature to investor type it serves:
     - BEGINNER: Simple, guided, no jargon, safe defaults
     - INTERMEDIATE: Control, customization, deeper analysis
     - ADVANCED: Full transparency, tools, data access, manual control
  3. Flag any gaps or feature misalignments
  
  Return: { features: [{name, current_state, beginner_fit, intermediate_fit, advanced_fit, gaps}], overall_coverage }`,
  {label: 'Product Discovery', phase: 'Discovery', schema: {type: 'object'}}
)

// Agent 2: UI/UX workflow analysis
const uiReview = await agent(
  `Conduct detailed UX workflow review of Fortress Intelligence:
  
  SCREENS TO REVIEW (from code):
  - Homepage / Login
  - Investment Genie Form (3-step allocation wizard)
  - Genie Results (allocation breakdown)
  - Fortress 30 List (stock screening with risk filters)
  - Fortress 30 Detail (individual stock view)
  - Portfolio Overview (strategy cards, P&L)
  - Portfolio Detail (holdings, rebalance actions)
  - Portfolio Edit (add/edit holdings)
  
  EVALUATION CRITERIA:
  1. SIMPLE: Is the path clear? Too many clicks? Cognitive load?
  2. FUN: Engaging? Surprising delights? Good micro-interactions?
  3. INFORMATIVE: Right data density? Too much noise? Progressive disclosure?
  4. TRANSPARENT: Can users understand why (allocation logic, rankings)?
  5. CONFIDENCE: Do users trust the recommendations?
  
  Return: { screens: [{name, simplicity_score, fun_score, info_score, transparency_score, issues}], overall_ux_health, quick_wins }`,
  {label: 'UX Workflow Review', phase: 'Discovery', schema: {type: 'object'}}
)

phase('Analysis')

// Agent 3: Chief Customer Officer perspective
const ccoInsight = await agent(
  `Review Fortress Intelligence from Chief Customer Officer lens:
  
  PERSONA ANALYSIS - Verify product-market fit:
  
  BEGINNER (22-35, new to investing, scared of losing money):
  - Pain: "I don't know where to start. Too much jargon. Want simplicity."
  - Need: Step-by-step guidance, safe defaults, no scary numbers
  - Question: Does Genie form FEEL approachable? Or overwhelming?
  
  INTERMEDIATE (30-50, has some portfolio, wants better allocation):
  - Pain: "I have stocks but no strategy. Want data-driven allocation."
  - Need: Customization, explanation of why, comparison tools
  - Question: Does Portfolio Tracker show enough control? Can they trust Fortress 30 rankings?
  
  ADVANCED (40-65, professional trader, wants competitive edge):
  - Pain: "Need edge. Tools feel generic. Want transparency on algorithms."
  - Need: Raw data, advanced metrics, manual override, real-time alerts
  - Question: Can advanced traders use this seriously? Or is it too simplified?
  
  EVALUATE:
  1. Customer Jobs to Be Done: allocation, discovery, tracking, learning
  2. Onboarding: Is signup → first value clear for each persona?
  3. Retention: What brings them back weekly/monthly?
  4. Trust: Do pricing/risks feel transparent?
  5. Support: Where would users get stuck? Are there help flows?
  
  Return: { beginner_cco_view: {fit, friction_points, wins}, intermediate_cco_view: {...}, advanced_cco_view: {...}, retention_leaks: [], trust_gaps: [], recommendation: "" }`,
  {label: 'Chief Customer Officer Review', phase: 'Analysis', schema: {type: 'object'}}
)

// Agent 4: Product Owner perspective
const poInsight = await agent(
  `Review Fortress Intelligence from Product Owner lens:
  
  FEATURE COMPLETENESS CHECK:
  
  Core Requirements (Investment Genie):
  ✓ Multi-market allocation (US/India)
  ✓ Risk-based profiles (Conservative/Balanced/Aggressive)
  ✓ Recommendation output
  ? Does it match the GOAL: "Help any investor size their allocation"?
  
  Discovery & Screening (Fortress 30):
  ✓ Stock filtering by risk tier
  ✓ Live market data
  ? Are rankings trustworthy? How are candidates selected?
  ? Why should user trust top 30 over other screens?
  
  Execution & Tracking (Portfolio Tracker):
  ✓ Strategy creation
  ✓ Holdings tracking
  ✓ Rebalance alerts
  ? Missing: Performance attribution? Fee tracking? Tax-loss harvesting hints?
  
  EVALUATE:
  1. Roadmap alignment: Does current feature set support Phase 2 (trading skills), Phase 3 (feedback loop)?
  2. Platform robustness: Is it ready for 1K daily active users? Scaling limits?
  3. Data quality: How confident are we in rankings? What's the backtest track record?
  4. Competitive positioning: vs Etoro, Wealthfront, Groww, Coin DCX?
  5. Growth levers: What drives virality or retention? Clear secondary features?
  
  Return: { requirement_fulfillment: {name, required, current, ready_for_production}, gaps: [], scaling_concerns: [], competitive_positioning: "" }`,
  {label: 'Product Owner Review', phase: 'Analysis', schema: {type: 'object'}}
)

// Agent 5: PM Product Discovery perspective
const pmInsight = await agent(
  `Review Fortress Intelligence from PM Product Discovery lens:
  
  MARKET POSITIONING & DISCOVERY:
  
  TARGET MARKET: "Investment allocation engine for US + India markets"
  
  Questions to validate:
  1. WHO: 
     - Beginner investors → learning curve too high? Missing handholding?
     - India diaspora → USD/INR conversion confusing? Tax implications missing?
     - Busy professionals → time to value? Can they decide in <5 min?
  
  2. WHY NOW:
     - Post-COVID: retail investing surge (India + US) ✓
     - AI boom: LLM-powered allocation (vs rule-based) ✓
     - Mobile-first: most users on phone? Design validated?
  
  3. WHAT MAKES IT DIFFERENT:
     - Multi-market: Most tools are single-market
     - Hybrid (AI + manual): Smart but is it clear users can override?
     - Transparency: Can user see the logic? Or black box?
  
  4. HOW WILL THEY FIND US:
     - Organic: SEO for "portfolio allocation India"? Landing page exists?
     - Referral: Would Beginner tell Intermediate? Would Intermediate tell Advanced?
     - Paid: Unit economics clear? CAC sustainable?
  
  5. WHEN SHOULD WE SCALE:
     - Current: Can it handle 10x traffic? DB indexed? API caching?
     - Market: Is there analyst coverage? Press kit ready?
  
  EVALUATE:
  1. Discovery funnel: How easy is it for target user to FIND Fortress?
  2. Activation: First-time user journey (Genie → Results → Action)?
  3. Retention: Weekly active users metric? Rebalance frequency?
  4. Expansion: Can Beginner upgrade to Intermediate/Advanced features?
  5. Advocacy: NPS likely? Would they recommend to peers?
  
  Return: { market_fit_score, investor_persona_resonance: {beginner, intermediate, advanced}, discovery_health: {organic, referral, paid}, activation_funnel: {steps, drop_off_risk}, expansion_potential: "" }`,
  {label: 'PM Product Discovery Review', phase: 'Analysis', schema: {type: 'object'}}
)

phase('Synthesis')

// Synthesize all inputs into honest, actionable feedback
const allInsights = await parallel([
  () => productState,
  () => uiReview,
  () => ccoInsight,
  () => poInsight,
  () => pmInsight
])

log(`Synthesizing 5 independent reviews into cohesive CXO feedback...`)

const synthesis = await agent(
  `You are a Senior Product Analyst reporting to the founder on Fortress Intelligence.
  
  INPUTS FROM REVIEWS:
  
  Product State: ${JSON.stringify(allInsights[0], null, 2)}
  UI/UX Analysis: ${JSON.stringify(allInsights[1], null, 2)}
  CCO Perspective: ${JSON.stringify(allInsights[2], null, 2)}
  PO Perspective: ${JSON.stringify(allInsights[3], null, 2)}
  PM Discovery: ${JSON.stringify(allInsights[4], null, 2)}
  
  SYNTHESIS TASK:
  
  Provide HONEST feedback in this structure:
  
  1. OVERALL VERDICT (1 paragraph)
     - Is Fortress ready for production across all investor types?
     - What's the core strength? Core risk?
  
  2. INVESTOR PERSONA ASSESSMENT (3 sections)
     For BEGINNER, INTERMEDIATE, ADVANCED:
     - Fit score (1-10)
     - What works TODAY
     - What's missing / broken
     - Confidence they'll use it
  
  3. SIMPLE / FUN / EXCITING / MEETS GOALS (4-part score)
     SIMPLE (1-10): "Can a beginner understand without help?"
     FUN (1-10): "Would they smile using it? Or grind through it?"
     EXCITING (1-10): "Does it feel innovative or like a standard finance app?"
     MEETS GOALS (1-10): "Does it help investors (any type) allocate better?"
  
  4. TOP 3 STRENGTHS
     - Most differentiated feature
     - Best UX moment
     - Biggest competitive edge
  
  5. TOP 5 CRITICAL ISSUES (prioritized by impact)
     Issue → Why it matters → Fix complexity (quick win / medium / hard)
  
  6. QUICK WINS (can ship in <1 week, high impact)
     - Example: "Add explanation tooltips to Fortress 30 rankings"
  
  7. STRATEGIC RECOMMENDATIONS (30-60 days)
     - Where to double down
     - Where to simplify
     - Market positioning shift (if any)
  
  8. GO / NO-GO DECISION
     - Ready to ship Phase 2 (trading skills)?
     - Ready for marketing launch?
     - Hold and fix first?
  
  Be HONEST. Don't sugarcoat. Founder wants truth, not validation.`,
  {label: 'Synthesis & CXO Report', phase: 'Synthesis', schema: {type: 'object'}}
)

return {
  cxo_report: synthesis,
  supporting_reviews: {
    product_discovery: productState,
    ux_analysis: uiReview,
    cco_perspective: ccoInsight,
    po_perspective: poInsight,
    pm_discovery: pmInsight
  }
}
