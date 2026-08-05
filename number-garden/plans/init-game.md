Build a simple mobile-friendly educational math game for young children using a single HTML file with embedded CSS and JavaScript.

The game should teach place-value addition using ones, tens, and hundreds.

## Existing repository

Inspect the existing project before making changes.

Relevant resources:

- `poc-game.html`
  - Shows the basic game concept.
  - Shows how HTML, CSS, and JavaScript can be embedded in one file.
  - Its UX is crude and must not be copied.

- `server.py`
  - Small local web server used to serve the HTML page.
  - Preserve compatibility with it.

- `mock/`
  - Contains UX mockup images.
  - Use them only as visual inspiration for layout, artwork, colors, progress indicators, and general interaction style.
  - The mockups may contain mathematically incorrect states.
  - Never derive game state or arithmetic logic from the images.

## Deliverable

Create or replace the main game page as a standalone HTML file with:

- Embedded CSS
- Embedded JavaScript
- No build process
- No framework
- No external runtime dependency
- No backend state
- No CDN requirement
- No external image dependency unless an existing local asset is already present

The page must work by opening it directly in a browser and when served using `server.py`.

Do not modify `poc-game.html` ; create `index.html` with your changes.

## Target devices

Primarily Design mobile-first for an iPhone17 portrait screen.

Secondary support for 
- Narrow phones around 360 px wide
- Larger phones

When viewed in larger displays, use padding. 
- Tablets
- Desktop browsers

(no need for fully responsive; iphone is the main use case)

Do not create a wide tablet dashboard squeezed into a phone. The main interaction must fit naturally in portrait orientation.

Avoid Vertical scrolling as much as possible. For the current problem, place-value representations, counting state, and primary action should remain easy to reach.

Touch targets should be at least approximately 44 × 44 CSS pixels where practical.

## Game concept

Generate addition problems involving two non-negative two-digit numbers.

Examples:

- `23 + 14`
- `58 + 47`
- `67 + 89`

The game must support:

- Addition without carrying
- Carrying from ones to tens
- Carrying from tens to hundreds
- Results up to three digits

The arithmetic must come entirely from JavaScript game logic.

## Header

At the top, show:

- A gamified progress journey on the left or centre
  - Example stages: seed, sprout, tree, flower, butterfly
  - The active stage should be visually clear
- A score on the right
  - Display using a dollar or coin symbol, such as `$100` or `🪙 100`
- An optional sound toggle
- An optional restart or settings control

Keep the header compact on phones.

## Problem display

Below the header, prominently show the current equation:

`58 + 47 = ?`

Use distinct colors for the two addends.

The answer should remain hidden until the child completes the interaction or activates the solver.

## Place-value layout

Represent each addend using place-value columns:

- Hundreds
- Tens
- Ones

For ordinary two-digit addends, the hundreds cells remain empty.

On a phone, prioritize tens and ones. The hundreds column may be narrower or revealed mainly when needed, but the final three-digit result must remain understandable.

Show the first addend above the second addend.

Keep corresponding place-value positions vertically aligned.

## Tens representation

A ten is represented by one horizontal bar.

Each tens panel must always contain ten possible bar positions.

For example:

- Digit `5`: five filled bars and five empty bar slots
- Digit `4`: four filled bars and six empty bar slots

Lay the ten bar positions out compactly, preferably as a two-column by five-row grid or another arrangement that works cleanly on a narrow phone.

The important invariant is:

- Exactly ten visible positions
- Filled positions represent the digit
- Remaining positions stay visibly empty

Do not use a full 100-square grid to represent a tens digit.

## Ones representation

Each ones panel must always show ten separate square cells in a horizontal strip.

For example:

- Digit `3`: first three cells filled, remaining seven empty
- Digit `8`: first eight cells filled, remaining two empty

The cells must remain individually tappable and visually distinct.

When two rows are combined and the total exceeds ten, show an additional row of ten cells.

Example for `8 + 7`:

- First combined row: ten filled cells
- Second combined row: five filled cells and five empty cells

## Alignment between addends

Align the two addends so that their filled cells visually demonstrate how they combine.

Example: `5 + 3`

First addend:

`■■■■■□□□□□`

Second addend should visually continue after the first five positions:

`□□□□□■■■□□`

This continuation alignment is for the combination/counting mode.

The normal place-value view may initially show each digit left-aligned, but when counting or solving, the layout should clearly demonstrate the second quantity filling the empty positions left by the first.

Use different colors for the two addends.

For example:

- First addend: blue
- Second addend: green
- Carried ten: gold or orange

## Counting interaction

The child must be able to count by tapping bars or cells.

Required behaviour:

1. Tapping an eligible block advances the temporary count.
2. The temporary count is displayed prominently.
3. Counted blocks receive a clear visual state.
4. Counting should proceed in logical order.
5. Counting should span both addends.
6. Blocks representing corresponding place-value positions should be coordinated.

For ones:

- Count through the first addend and then the second addend.
- When the count crosses ten, clearly indicate that ten ones can become one ten.

For tens:

- Count all original tens plus any carried ten.
- If the total reaches ten tens, convert them into one hundred.

Avoid allowing random taps to corrupt the count. Either:

- Only make the next valid block tappable, or
- Accept any tap but compute the count deterministically and ignore duplicates

The first approach is preferred for a young child.

## Carry from ones to tens

When the combined ones total reaches or exceeds ten:

1. Show ten filled ones cells grouped together.
2. Highlight or animate those ten cells.
3. Display a message such as:
   - `10 ones make 1 ten`
4. Animate a new carried ten bar moving into the tens area.
5. Show the carried bar as an additional blinking or glowing bar.
6. Leave the remaining ones visible in the result row.

Example:

`8 + 7 = 15 ones`

Then:

- Carry one ten
- Leave five ones

The carry must be based on arithmetic logic, not hard-coded for a particular example.

## Carry from tens to hundreds

After adding the tens digits and the carried ten:

- If the total is ten or greater, group ten tens into one hundred.
- Animate or clearly show the carry into the hundreds column.
- Represent the hundred using a compact hundred tile or a clearly labelled `100` block.
- Leave any remaining tens in the tens result panel.

Example:

`58 + 47`

- Ones: `8 + 7 = 15`
- Carry one ten, leave five ones
- Tens: `5 + 4 + 1 = 10`
- Carry one hundred, leave zero tens
- Result: `105`

## Solver button

Add a large primary `Solver` button.

The solver is not merely an answer reveal.

When pressed, it should perform an animated teaching sequence:

1. Combine the ones from both addends.
2. Fill available empty ones cells using the second addend’s color.
3. Create a second ones row if needed.
4. Group ten ones.
5. Animate the carry into tens.
6. Combine the tens bars.
7. Include the carried ten.
8. Group ten tens if needed.
9. Animate the carry into hundreds.
10. Reveal the final answer.
11. Show a success animation and update the score/progress.

Keep animations short and understandable. Do not make the child wait through slow decorative animation.

The solver button should be disabled while an animation is already running.

## Manual learning flow

The child should also be able to solve by tapping without using the solver immediately.

Provide clear contextual instructions such as:

- `Count the ones`
- `Tap the next box`
- `10 ones make 1 ten`
- `Now count the tens`
- `10 tens make 1 hundred`

After the correct answer is reached:

- Reveal the equation result
- Show a positive but brief celebration
- Increase the score
- Advance the progress journey
- Offer a `Next problem` button

## Game state

Model the interaction explicitly in JavaScript.

Suggested phases:

- `idle`
- `counting-ones`
- `carrying-to-tens`
- `counting-tens`
- `carrying-to-hundreds`
- `completed`

Keep arithmetic state separate from DOM rendering.

Suggested state fields:

- First addend
- Second addend
- Ones count
- Tens count
- Hundreds count
- Carried tens
- Carried hundreds
- Current phase
- Temporary count
- Score
- Progress stage
- Whether animation is running

Do not infer state by reading CSS classes from the DOM.

## Problem generation

Generate valid random two-digit addition problems.

Include a balanced mix of:

- No carry
- Ones carry only
- Ones and hundreds carry

Avoid repeatedly producing the same problem.

For development and debugging, make it easy to force a known problem such as `58 + 47`.

A small internal constant or query parameter is acceptable.

## Visual style

Use the mockups as inspiration for:

- Friendly rounded cards
- Soft shadows
- Bright but controlled colors
- Nature-themed progress icons
- Large readable numbers
- Clear color separation between addends
- Child-friendly success feedback

Do not overcrowd the screen with decorative characters.

The mathematical blocks must remain the strongest visual element.

Avoid text that is too small for a six-year-old.

## Accessibility and interaction quality

Include:

- Semantic buttons
- Keyboard support for major controls
- Visible focus states
- `aria-label` values for tappable blocks
- Respect for `prefers-reduced-motion`
- High enough contrast for text and block boundaries
- No essential information conveyed using color alone

Prevent accidental text selection during repeated tapping.

## Persistence

Use `localStorage` for:

- Score
- Progress stage
- Sound preference

Provide a reset action that clears progress after confirmation.

The game must still work when `localStorage` is unavailable.

## Sound

Sound is optional.

If implemented:

- Use small sounds generated with the Web Audio API
- You can download external audio files with compatible license (our license will be Apache 2.0)
- Respect the sound toggle
- Do not autoplay sound before user interaction

## Code quality

Keep everything in the single HTML file, but structure the JavaScript cleanly.

Use:

- Small named functions
- A central state object
- Pure arithmetic helper functions where practical
- A single render function or clearly separated render functions
- CSS custom properties for repeated design values

Avoid:

- Large unstructured event-handler code
- Inline `onclick` attributes
- Global mutable variables scattered throughout the file
- Hard-coded arithmetic for the sample problem
- Canvas unless there is a compelling reason
- External libraries

Add concise comments only where the interaction or carry logic is non-obvious.

## Validation

Before finishing, verify at least these cases:

1. `23 + 14 = 37`
   - No carry

2. `28 + 17 = 45`
   - Carry from ones to tens

3. `58 + 47 = 105`
   - Carry from ones to tens and tens to hundreds

4. `67 + 89 = 156`
   - Ones carry and result in hundreds

5. `99 + 99 = 198`
   - Maximum two-digit inputs

Confirm for each case:

- Filled and empty block counts are correct
- Temporary counting is correct
- Carry animation occurs only when required
- Remaining ones and tens are correct
- Final answer is correct
- The page remains usable at 390 × 844

## Final work

Implement the game rather than only describing it.

After implementation:

1. Run it locally using the existing `server.py`.
2. Check the browser console for errors.
3. Test the required arithmetic cases.
4. Summarize:
   - Files changed
   - Main interaction flow
   - Any deliberate UX deviations from the mockups
   - Remaining limitations


