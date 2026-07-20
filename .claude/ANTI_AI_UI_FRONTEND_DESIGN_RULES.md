# Anti-AI UI and Frontend Design Rules

> **Status:** Mandatory design and implementation standard  
> **Applies to:** Product designers, frontend developers, AI coding agents, UI generators, design-system contributors, and reviewers  
> **Purpose:** Prevent generic, visibly AI-generated, inaccessible, context-free, and visually overprocessed interfaces.

---

## 1. Normative Language

The words below are requirements:

- **MUST / MUST NOT**: Non-negotiable. A violation blocks review or release.
- **SHOULD / SHOULD NOT**: Expected unless a documented product reason justifies an exception.
- **MAY**: Optional and context-dependent.

A design is not acceptable merely because it looks polished, modern, minimal, or technically correct. It must reflect the product, user task, content, brand, platform, and operating context.

---

## 2. Prime Directive

> **Do not generate a visual style before understanding the product.**

Before creating or changing a screen, the designer or agent MUST identify:

1. The user and their role.
2. The primary task on the screen.
3. The most important information.
4. The primary action.
5. The consequence of mistakes.
6. The expected device and viewport.
7. Relevant brand rules and existing design-system components.
8. Required loading, empty, success, warning, error, disabled, and permission states.

A screen created without this context MUST be treated as a draft, not production UI.

---

# Part I: Recognizable AI-Generated UI Tells

These patterns are not automatically wrong in isolation. They become signs of low-quality AI output when selected by default, repeated without purpose, or disconnected from the product.

## 3. Default AI Aesthetic Is Prohibited

The UI MUST NOT use any of the following as an automatic definition of “modern”:

- Purple-to-blue, purple-to-cyan, or blue-to-pink gradients.
- Neon glows on dark backgrounds.
- Large blurred gradient blobs behind content.
- Glassmorphism across ordinary cards, forms, tables, or navigation.
- Translucent panels placed over visually noisy backgrounds.
- Random mesh gradients.
- “Aurora” backgrounds unrelated to the brand.
- Dark mode merely because the product is technical.
- Monospace text merely to create a developer or hacker appearance.
- Generic futuristic grids, particles, stars, or glowing orbs.
- Decorative noise textures added only to make a flat layout feel designed.

A gradient, glow, transparency effect, or textured background MAY be used only when it belongs to the brand system, improves hierarchy, or communicates a real state.

## 4. Cardocalypse Is Prohibited

The UI MUST NOT:

- Put every piece of information inside a card.
- Nest cards inside cards without a structural reason.
- use a card when spacing, alignment, a divider, a list, or a table would communicate the relationship more clearly.
- Create six identical cards with an icon, heading, two lines of text, and a link merely to fill a grid.
- Convert simple settings, metadata, or form groups into floating dashboard tiles.
- Use the same elevation, border, radius, and padding for every content block.
- Break one coherent workflow into many visually disconnected containers.
- Use a “bento grid” only because it is fashionable.

A container MUST communicate grouping, hierarchy, interaction, selection, or separation. If removing its background and border changes nothing, it probably should not be a card.

## 5. Rounded-Corner Abuse Is Prohibited

The UI MUST NOT:

- Apply large radii to every panel, input, image, modal, table, button, badge, and navigation item.
- Turn every label and control into a pill.
- Use capsule buttons for long text.
- use fully rounded inputs without a product-specific reason.
- Mix many arbitrary corner radii.
- use rounded rectangles as decoration around icons that already communicate clearly.

The design system SHOULD define a small radius scale. Component shape MUST reflect component role, not an AI model’s default styling.

## 6. Icon Decoration Abuse Is Prohibited

The UI MUST NOT:

- Place a large generic icon above every heading.
- Put every icon inside a colored circle or rounded square.
- Use icons as decoration when they add no meaning.
- Use an icon-only control when its meaning is not universally clear.
- Mix icon libraries, stroke widths, visual sizes, or metaphors.
- Use sparkle, wand, rocket, brain, lightning, shield, globe, or robot icons as generic symbols of quality, speed, intelligence, security, or innovation.
- Add chevrons to elements that do not navigate or expand.
- use a familiar icon for an unfamiliar action.

Important actions SHOULD include visible text labels. Icon-only controls MUST have accessible names and clear hover/focus descriptions where needed.

## 7. Generic SaaS Composition Is Prohibited

Do not automatically generate:

- A centered hero with a huge headline, vague paragraph, and two generic CTA buttons.
- A “trusted by” logo row with invented or irrelevant logos.
- Three equal feature cards under every hero.
- A large product screenshot floating in a glowing browser frame.
- A dashboard with four metric cards followed by a generic chart.
- A left sidebar containing every possible module.
- A command palette when the product does not need expert navigation.
- A pricing table with a glowing “Most Popular” plan without evidence.
- A testimonial carousel with fabricated people or quotes.
- A decorative world map for products that are merely available online.
- Fake real-time counters, charts, notifications, or activity feeds.
- Landing-page sections copied from the structure of unrelated SaaS products.

Page structure MUST follow the user journey and content model, not a standard AI landing-page template.

## 8. Typography Defaults Must Be Deliberate

The UI MUST NOT:

- Select Inter, Geist, or another popular UI font only because it is a safe AI default.
- Use a display serif plus neutral sans merely to imitate editorial design.
- Use monospace for ordinary labels, numbers, or metadata without purpose.
- Apply gradient fill to headings.
- Use oversized headings to compensate for weak content.
- Make every section heading look equally important.
- use extreme letter spacing on small uppercase labels.
- use light font weights on low-contrast backgrounds.
- create an excessive type scale with many nearly identical sizes.
- mix font families without defined roles.

Typography MUST be selected for brand fit, language support, readability, platform performance, and content density. A small, documented type scale SHOULD be used.

## 9. Shadow, Border, and Elevation Noise Is Prohibited

The UI MUST NOT:

- Add a shadow to every component.
- Add a one-pixel gray border around every surface.
- combine border, shadow, glow, gradient, and transparency on the same ordinary component.
- use multiple competing shadow styles.
- imply that a noninteractive element is clickable through elevation.
- use heavy shadows merely to make white cards visible on a pale background.
- add colored top borders to unrelated cards for artificial variety.

Use spacing and hierarchy before decoration. Elevation MUST indicate layering, overlap, interaction, or temporary surfaces.

## 10. Artificial Visual Variety Is Prohibited

The UI MUST NOT create variety by randomly changing:

- Icon background colors.
- Card border colors.
- Gradient direction.
- Corner radius.
- Alignment.
- Illustration style.
- Heading treatment.
- Shadow.
- Badge style.
- Component width.

Variation MUST encode meaning or hierarchy. Random variety is not design.

---

# Part II: Hierarchy, Layout, and Information Architecture

Research from Nielsen Norman Group found that AI-generated prototypes commonly repeat information, emphasize the wrong elements, group related content poorly, overuse color, and apply inconsistent margins. These are release-blocking issues, not minor polish concerns.

## 11. Every Screen Must Have a Clear Priority

Each screen MUST have:

- One clearly identifiable purpose.
- One primary information region.
- At most one visually dominant primary action per task stage.
- A readable order from page title to task content to action.
- Clear distinction between navigation, content, controls, and status.

The UI MUST NOT give equal visual weight to all elements.

## 12. Do Not Repeat Information Without Purpose

The UI MUST NOT:

- Show the same status in multiple nearby cards.
- Repeat a user profile, total, progress value, or label in several regions.
- Duplicate actions in the header, card, and footer without a demonstrated need.
- repeat a heading in a card when the surrounding section already supplies the same context.
- display desktop summary content again in a sidebar purely to fill space.

Repeated information MUST have a distinct use, context, or interaction.

## 13. Related Items Must Be Visually Grouped

The UI MUST:

- Place labels near their values.
- Place help text near the control it explains.
- Place errors next to the field that caused them.
- Keep action controls near the object they affect.
- Use tighter spacing within a group than between groups.
- preserve meaningful sequence in both visual and DOM order.

The UI MUST NOT separate related content with arbitrary large gaps.

## 14. Use a Real Spacing System

The frontend MUST use a documented spacing scale.

It MUST NOT:

- use arbitrary values throughout the same screen.
- produce inconsistent margins between equivalent components.
- rely on repeated manual pixel nudges.
- use excessive whitespace to imitate premium design.
- compress dense operational screens into visually attractive but unreadable layouts.
- use identical spacing for relationships of different strength.

Whitespace MUST communicate hierarchy and grouping.

## 15. Alignment Must Be Intentional

The UI MUST NOT:

- center-align long body copy, forms, tables, or task-heavy interfaces.
- randomly alternate left, center, and right alignment.
- align controls by their container rather than by their content when this harms scanning.
- misalign headings, labels, values, inputs, or table columns.
- use a centered page composition when users need to scan and compare data.

Use grids and alignment to make information easier to scan.

## 16. Content Density Must Match the Task

The UI MUST NOT assume that minimal means usable.

- Operational dashboards MAY be dense when users need rapid comparison.
- Marketing pages MAY use more whitespace when storytelling benefits.
- Forms SHOULD expose only the information needed at the current step.
- Tables SHOULD remain tables when comparison across rows and columns matters.
- Lists SHOULD remain lists when items share a repeated structure.

Do not turn useful density into empty decorative space. Do not turn simple tasks into dashboards.

## 17. Responsive Design Must Recompose, Not Merely Shrink

At supported breakpoints, the UI MUST:

- preserve task priority.
- keep controls reachable.
- prevent horizontal page scrolling except for justified data regions.
- reflow tables, filters, navigation, and toolbars appropriately.
- preserve readable text sizing.
- maintain logical focus and reading order.
- handle long labels, translations, and real data.

The UI MUST NOT simply stack every desktop card into one extremely long mobile page.

---

# Part III: Components and Interaction

## 18. Use Familiar Components for Familiar Tasks

The UI SHOULD use native elements or established design-system components for:

- Buttons.
- Links.
- Inputs.
- Checkboxes.
- Radio groups.
- Select controls.
- Dialogs.
- Tabs.
- Tables.
- Menus.
- Progress indicators.

The UI MUST NOT invent a novel control merely to look unique.

## 19. Buttons and Links Must Behave Correctly

- A **button** performs an action.
- A **link** navigates to a destination.

The UI MUST NOT:

- style links and buttons identically when their behavior differs.
- use “Click here.”
- show several competing primary buttons.
- use vague labels such as “Continue,” “Submit,” or “Get Started” when a specific action label is possible.
- put destructive and safe actions next to each other without distinction.
- disable an action without explaining why when the reason is not obvious.
- make an entire large card clickable while also placing conflicting nested controls inside it.

Button labels SHOULD describe the result, such as “Create rescue order,” “Save traveler details,” or “Send verification email.”

## 20. Pills and Badges Are Not General-Purpose Containers

Pills or badges MAY represent:

- Short status.
- Category.
- Filter.
- Compact count.
- Removable token.

They MUST NOT contain:

- Sentences.
- Primary actions.
- Long navigation labels.
- Multi-line content.
- Complex controls.
- Important explanatory text.

## 21. Tables Must Not Be Replaced With Card Grids Without Reason

Use a table when users need to:

- Compare multiple records.
- Scan repeated fields.
- Sort or filter structured data.
- Review operational information.
- Select or act on several records.

The UI MUST NOT replace a functional desktop table with decorative cards solely to appear modern.

A mobile alternative MAY use stacked rows or disclosure patterns, but it MUST preserve key comparisons and actions.

## 22. Navigation Must Reflect User Mental Models

The UI MUST NOT:

- create navigation categories based on implementation modules alone.
- expose all routes to every role.
- hide primary destinations behind an overflow menu.
- use icons without labels for core navigation.
- create deeply nested menus to accommodate every backend entity.
- place settings, profile, notifications, and core task modules at the same hierarchy level without reason.
- move persistent navigation unpredictably between screens.

Navigation labels MUST use the language users know.

## 23. Modals Must Be Rare and Focused

A modal MUST NOT:

- contain a long multi-step workflow when a page would be clearer.
- open another modal.
- be used for ordinary read-only details.
- trap users without a safe close path.
- discard entered data without warning.
- rely only on clicking outside to close.
- contain multiple unrelated actions.

Use modals for focused decisions, short forms, confirmations, or temporary context.

## 24. Destructive Actions Require Care

For deletion, cancellation, irreversible submission, financial action, or sensitive data changes:

- State exactly what will happen.
- Identify the affected item.
- distinguish destructive styling without relying only on color.
- provide confirmation proportional to risk.
- preserve a safe cancellation path.
- offer undo when feasible.
- prevent accidental duplicate submission.

Generic “Are you sure?” messages are prohibited.

---

# Part IV: Forms and Validation

## 25. Labels Must Remain Visible

The UI MUST NOT:

- use placeholder text as the only label.
- hide labels after input.
- rely only on icons to identify fields.
- use ambiguous labels such as “Name” when “Traveler’s full name” is required.
- mark required fields only by color.
- place essential format instructions only inside placeholders.

## 26. Forms Must Ask Only What Is Needed

The UI MUST NOT:

- collect fields merely because they exist in the database.
- ask users to re-enter known information.
- split a short form into unnecessary steps.
- combine unrelated topics into one overwhelming form.
- expose internal codes or implementation terminology.
- require optional information without a real business reason.

## 27. Validation Must Help Recovery

When validation fails, the UI MUST:

- preserve the user’s entered values.
- explain what is wrong.
- explain how to fix it.
- place the message next to the affected field.
- provide an error summary for long or complex forms.
- move focus appropriately for keyboard and screen-reader users.
- use specific messages.

The UI MUST NOT display only:

- “Invalid input.”
- “An error occurred.”
- “Something went wrong.”
- “This field is required.”
- “Error 400.”
- “Submission failed.”

Examples of acceptable messages:

- “Enter the traveler’s passport number.”
- “Expiry date must be after 20 July 2026.”
- “Upload a JPG, PNG, or PDF smaller than 10 MB.”

## 28. Do Not Validate Aggressively Without Evidence

The UI SHOULD NOT show an error the moment a user focuses, types the first character, or leaves a partially completed field unless user research shows that immediate validation helps.

Validation MUST NOT fight the user while they are still entering valid data.

## 29. Disabled Submit Buttons Must Not Hide Errors

The UI SHOULD prefer allowing submission and then showing clear validation errors.

When a submit button is disabled:

- The reason MUST be visible or immediately discoverable.
- Keyboard and assistive-technology users MUST receive the same explanation.
- The form MUST not leave users guessing which requirement remains incomplete.

---

# Part V: Content and UX Writing

## 30. Generic AI Marketing Language Is Prohibited

Avoid empty phrases such as:

- “Unlock the power of…”
- “Elevate your experience.”
- “Seamlessly transform…”
- “Revolutionize your workflow.”
- “Supercharge your productivity.”
- “Built for the future.”
- “Next-generation solution.”
- “All-in-one platform.”
- “Effortlessly manage everything.”
- “Empowering innovation.”
- “Where innovation meets simplicity.”
- “Your journey starts here.”

Claims MUST be concrete, provable, and product-specific.

## 31. Headings Must Carry Information

The UI MUST NOT use vague headings such as:

- “Welcome Back”
- “Overview”
- “Insights”
- “Discover More”
- “Powerful Features”
- “Everything You Need”
- “Why Choose Us?”
- “Take Control”
- “Built Different”

unless the following content makes the heading specific and the label is genuinely useful.

A heading SHOULD tell users what the section contains or what they can do.

## 32. Do Not Explain the Obvious Repeatedly

The UI MUST NOT:

- repeat a heading in the subtitle.
- restate button text in nearby helper copy.
- add explanatory paragraphs to self-evident controls.
- produce a label, tooltip, caption, and helper text that all say the same thing.
- use verbose “AI assistant” language for ordinary system messages.

Be concise, but do not remove information needed for safe decisions.

## 33. Status and System Messages Must Be Specific

Replace:

- “Success!” with what succeeded.
- “Failed” with what failed and what the user can do.
- “Processing” with the process being performed.
- “No data” with what is absent and how to create or find it.
- “Access denied” with a safe explanation and next step.

Do not expose sensitive internal details, stack traces, tokens, or service names.

---

# Part VI: States, Data, and Operational Reality

## 34. Every Data-Driven Screen Must Define Its States

Before release, each relevant component or page MUST define:

- Initial state.
- Loading state.
- Empty state.
- Populated state.
- Partial-data state.
- Error state.
- Offline or disconnected state where relevant.
- Permission-restricted state.
- Disabled state.
- Success state.
- Stale-data state where relevant.

A screenshot of the ideal populated state is not a complete design.

## 35. Loading Must Represent the Real Process

The UI MUST NOT:

- show an infinite spinner without context.
- use fake progress percentages.
- flash skeletons for operations that complete almost instantly.
- make skeletons visually more complex than the final content.
- block the entire page when only one region is updating.
- animate every skeleton element excessively.

Loading text SHOULD identify the operation when delay is meaningful.

## 36. Empty States Must Be Useful, Not Decorative

An empty state SHOULD answer:

1. What is empty?
2. Why might it be empty?
3. What can the user do next?

The UI MUST NOT fill empty states with generic space illustrations, rockets, boxes, sparkles, or cheerful characters unrelated to the product.

## 37. Do Not Fabricate Data for Production UI

The frontend MUST NOT ship with:

- Fake charts.
- Invented percentages.
- Meaningless trend arrows.
- Placeholder customer names presented as real.
- Fabricated testimonials.
- Random notifications.
- Decorative maps.
- Unverified trust marks.
- Simulated activity presented without a demo label.

Charts MUST have a decision-making purpose, valid data, units, labels, accessible alternatives, and an honest baseline.

## 38. Status Color Must Not Be the Only Signal

Statuses MUST use text and, where useful, icon or shape in addition to color.

Status colors MUST remain consistent throughout the product. The same color MUST NOT mean success in one module and warning in another.

---

# Part VII: Motion and Visual Effects

## 39. Motion Must Communicate, Not Perform

Animation MAY:

- Show spatial relationship.
- Confirm an action.
- Explain a state change.
- Maintain context during navigation.
- Draw attention to a critical, temporary event.

Animation MUST NOT:

- make every card rise, bounce, tilt, or glow on hover.
- animate text into view section by section on ordinary task screens.
- use parallax without a strong storytelling reason.
- continuously pulse noncritical elements.
- delay access to content.
- cause layout shift.
- play merely to make the UI feel premium.
- ignore reduced-motion preferences.

## 40. Hover Is Not a Complete Interaction Design

Every interaction available by hover MUST also work through keyboard and touch where applicable.

Critical content MUST NOT be accessible only on hover.

## 41. Avoid Excessive Microinteractions

The UI MUST NOT attach a unique animation to every component.

Interaction feedback SHOULD be fast, predictable, and consistent. A standard state change is often better than a theatrical transition.

---

# Part VIII: Accessibility Release Gates

WCAG 2.2 AA is the minimum target unless the project has a stricter requirement.

## 42. Contrast Is Mandatory

- Normal text MUST meet at least **4.5:1** contrast.
- Large text and essential graphical objects MUST meet the applicable WCAG contrast requirement.
- Focus indicators and component boundaries MUST remain visible against adjacent colors.
- Placeholder text MUST not be the only way to communicate essential information.
- Disabled-state styling SHOULD remain understandable without pretending disabled controls are active.

No design may be approved based only on how it looks on a high-end monitor.

## 43. Keyboard Access Is Mandatory

All functionality MUST be available by keyboard.

The frontend MUST NOT:

- remove focus outlines without an accessible replacement.
- create a keyboard trap.
- use an illogical focus order.
- focus hidden content.
- omit skip mechanisms where repeated blocks make them necessary.
- require drag-and-drop without an alternative.
- rely on pointer position for essential operation.

## 44. Touch Targets Must Be Usable

Pointer targets MUST meet WCAG 2.2 minimum target-size requirements, including applicable spacing exceptions.

As a product standard, frequently used touch controls SHOULD generally provide at least a **44 × 44 CSS pixel** interaction area where the layout allows.

Do not make critical actions tiny to preserve a visually clean layout.

## 45. Semantic HTML Is Mandatory

Use correct elements and structure:

- Heading levels in logical order.
- Real buttons for actions.
- Real links for navigation.
- Labels associated with inputs.
- Fieldsets and legends for grouped controls.
- Table semantics for tabular data.
- Lists for lists.
- Landmarks for page regions.
- Appropriate names, roles, values, and live-region behavior.

A visually correct `div` is not an accessible replacement for a semantic control.

## 46. Color, Shape, Sound, and Position Must Not Act Alone

Instructions MUST NOT depend only on:

- Color.
- Left or right position.
- Shape.
- Sound.
- Animation.
- Icon.
- Visual proximity that is absent in the DOM.

## 47. Zoom, Reflow, and Text Expansion Must Work

The UI MUST remain usable with:

- Browser zoom.
- Larger text.
- Long translated strings.
- System font scaling.
- Narrow viewports.
- Increased text spacing.

Text MUST NOT be embedded in images except for legitimate branding or unavoidable source material.

---

# Part IX: Frontend Engineering Rules

## 48. Do Not Generate One-Off CSS for Every Screen

The frontend MUST:

- Reuse design tokens.
- Reuse established components.
- Define variants intentionally.
- Keep component behavior consistent.
- document justified exceptions.

The frontend MUST NOT:

- add arbitrary hex colors when tokens exist.
- add arbitrary radii and shadows per page.
- duplicate the same component with slightly different CSS.
- use excessive absolute positioning for standard layout.
- hard-code heights that break real content.
- truncate important information without an accessible way to reveal it.
- solve responsive design with many fragile pixel-specific overrides.

## 49. Do Not Confuse Visual Polish With Product Completeness

A frontend change is incomplete until it handles:

- Real API data.
- Slow response.
- Empty response.
- API error.
- Partial permission.
- Long content.
- Localization.
- Keyboard operation.
- Mobile layout.
- loading and submission race conditions.
- duplicate actions.
- destructive action safety.
- accessibility names and announcements.

## 50. Performance Is Part of UI Quality

The UI MUST NOT add heavy libraries, background videos, particle systems, large animation packages, or oversized assets only for decoration.

Frontend changes SHOULD avoid:

- Layout shift.
- Blocking font loads.
- Huge unoptimized images.
- Unnecessary client-side JavaScript.
- Re-rendering entire pages for local changes.
- animations that trigger expensive layout work.
- loading complete icon packs when only a few icons are used.

## 51. AI-Generated Code Requires Human Review

Code generated by an AI agent MUST be reviewed for:

- Semantic correctness.
- Design-system compliance.
- Accessibility.
- State completeness.
- Responsive behavior.
- Error handling.
- Security and privacy.
- Content accuracy.
- Performance.
- consistency with adjacent screens.

Passing compilation is not design approval.

---

# Part X: Design Review Rejection Checklist

Reject the design or pull request when any answer below is **Yes**.

## Visual AI Tells

- [ ] Does it default to a purple/blue/cyan gradient?
- [ ] Does it use glass, glow, blur, or neon without a product reason?
- [ ] Is nearly everything inside a rounded card?
- [ ] Are there nested cards?
- [ ] Are there repeated three-column feature grids?
- [ ] Is every icon inside a colored tile?
- [ ] Are generic sparkles, rockets, brains, shields, or lightning icons used?
- [ ] Is dark mode used as the only design direction?
- [ ] Does the page look interchangeable with an unrelated SaaS product?
- [ ] Is visual variety random rather than meaningful?

## Hierarchy and Layout

- [ ] Is the primary task unclear?
- [ ] Are several actions competing as primary?
- [ ] Is information repeated?
- [ ] Are related elements separated?
- [ ] Are unrelated elements grouped?
- [ ] Are spacing values inconsistent?
- [ ] Is everything centered despite scan-heavy content?
- [ ] Is whitespace being used to hide weak information architecture?
- [ ] Does mobile merely stack the desktop layout?

## Components and Content

- [ ] Are links behaving as buttons or buttons as links?
- [ ] Are important icons unlabeled?
- [ ] Are pills used for long text or actions?
- [ ] Has a useful table been replaced by cards?
- [ ] Are labels vague?
- [ ] Does the copy contain generic AI marketing language?
- [ ] Are errors generic or unhelpful?
- [ ] Are empty states decorative instead of actionable?
- [ ] Is fake data presented as real?

## Accessibility and States

- [ ] Is contrast unverified or failing?
- [ ] Is keyboard focus missing or weak?
- [ ] Is any critical interaction hover-only?
- [ ] Are controls too small?
- [ ] Are placeholders acting as labels?
- [ ] Is status communicated only by color?
- [ ] Are loading, empty, error, and permission states missing?
- [ ] Does zoom, text expansion, or localization break the layout?
- [ ] Does animation ignore reduced-motion settings?

If any checked item lacks a documented, user-centered justification, the design MUST be revised.

---

# Part XI: Required Design Rationale

For any substantial new page, the author or AI agent MUST provide this before approval:

```md
## Design Rationale

- User:
- User goal:
- Primary task:
- Primary action:
- Highest-priority information:
- Main risk or costly mistake:
- Existing design-system components reused:
- Why this layout fits the task:
- Why each decorative effect is necessary:
- Responsive behavior:
- Accessibility considerations:
- Loading state:
- Empty state:
- Error state:
- Permission state:
- Destructive action behavior:
- Real data edge cases tested:
```

Statements such as “clean,” “modern,” “premium,” “beautiful,” or “user-friendly” are not valid rationale by themselves.

---

# Part XII: Pasteable Instruction for AI Coding Agents

```md
## UI Generation Standard

Do not produce generic AI-generated UI.

Before implementation, identify the user, primary task, primary information, primary action, risk, real data states, viewport, brand system, and existing components.

Strictly avoid default AI aesthetics:
- no automatic purple/blue/cyan gradients
- no neon glow or decorative blurred blobs
- no glassmorphism without a functional reason
- no card-on-card layouts
- no card for every content block
- no arbitrary bento grids
- no identical three-card feature sections
- no giant icon tile above every heading
- no excessive pills, rounded corners, borders, or shadows
- no generic dark dashboard
- no fake charts, metrics, testimonials, logos, or activity
- no generic SaaS copy
- no unnecessary animation or bounce-on-hover behavior

Use hierarchy, spacing, alignment, typography, and content before decoration. Reuse the existing design system. Prefer semantic HTML and familiar controls. Preserve visible labels. Use specific action labels and useful errors.

Every data-driven interface must include loading, empty, populated, partial, error, disabled, success, permission, and stale/offline states where applicable.

Meet WCAG 2.2 AA. Maintain visible keyboard focus, logical focus order, sufficient contrast, usable target sizes, reduced-motion support, semantic structure, and responsive reflow.

Do not claim completion until the UI has been checked with realistic content, long text, mobile widths, keyboard navigation, API failure, empty data, loading delay, and restricted permissions.

Every visual decision must be traceable to the product’s brand, content, hierarchy, interaction, or user need. If an effect has no reason, remove it.
```

---

# Part XIII: Exceptions

An exception is acceptable only when all conditions below are met:

1. It supports a documented brand rule, user need, content type, or platform convention.
2. It does not reduce accessibility or usability.
3. It remains consistent with the product.
4. It has been reviewed in realistic context.
5. The exception is documented in the design rationale.

The goal is not to ban gradients, cards, dark themes, rounded corners, illustrations, or animation. The goal is to ban their thoughtless use as AI defaults.

---

# Research Basis

This standard combines established usability and accessibility guidance with documented observations of current AI-generated interface patterns.

1. Nielsen Norman Group, **“Prompt to Design Interfaces: Why Vague Prompts Fail and How to Fix Them”**  
   AI-generated interfaces were observed repeating elements, adding noise, producing weak organization, and emphasizing the wrong content.  
   https://www.nngroup.com/articles/vague-prototyping/

2. Nielsen Norman Group, **“Good from Afar, But Far from Good: AI Prototyping in Real Design Contexts”**  
   Reported issues included weak hierarchy and grouping, overused colors, poor contrast, and inconsistent margins.  
   https://www.nngroup.com/articles/ai-prototyping/

3. Nielsen Norman Group, **“AI Design Tools Are Marginally Better: Status Update”**  
   Concludes that broad AI design generation still requires substantial professional judgment, while narrower AI assistance is more useful.  
   https://www.nngroup.com/articles/ai-design-tools-update-2/

4. Nielsen Norman Group, **“Analyzing Good Designs: Figma’s Shortcut”**  
   Highlights grid alignment, hierarchy, intentional color, and consistency as characteristics of strong visual design.  
   https://www.nngroup.com/videos/analyzing-figmas-shortcut/

5. W3C, **Web Content Accessibility Guidelines (WCAG) 2.2**  
   Normative accessibility requirements covering contrast, keyboard access, focus, navigation, target size, motion, errors, semantics, and more.  
   https://www.w3.org/TR/WCAG22/

6. web.dev, **Color and Contrast**  
   Practical explanation of WCAG contrast thresholds for text and essential graphics.  
   https://web.dev/learn/accessibility/color-contrast

7. Apple, **Human Interface Guidelines: Design Principles**  
   Emphasizes purpose, familiarity, flexibility, simplicity, hierarchy, accessibility, feedback, consistency, and craft.  
   https://developer.apple.com/design/human-interface-guidelines/design-principles

8. Apple, **Human Interface Guidelines: Layout**  
   Covers visual hierarchy, reading order, alignment, adaptability, and placement by relative importance.  
   https://developer.apple.com/design/human-interface-guidelines/layout

9. GOV.UK Design System, **Recover from Validation Errors**  
   Provides tested guidance on preserving entered information, presenting error summaries, focusing errors, and avoiding premature validation.  
   https://design-system.service.gov.uk/patterns/validation/

10. GOV.UK Design System, **Error Message**  
    Requires errors to explain what happened and how to fix it using clear, concise, specific language.  
    https://design-system.service.gov.uk/components/error-message/

11. SmoothUI, **“AI Design Slop: Why AI-Generated UI Looks Generic — and the Fix”**  
    Industry commentary documenting common current clichés such as purple-to-cyan gradients, glass effects, identical card grids, neon glow, excessive hover motion, and missing production states.  
    https://smoothui.dev/blog/ai-design-slop

---

## Final Standard

> A strong interface should look like it was designed for its users, content, brand, risks, and workflows. It should not look like the statistical average of thousands of unrelated SaaS screenshots.
