# Number Garden

Number Garden is a mobile-first place-value arithmetic game with twenty persistent learning levels. L1–L9 teach addition and regrouping, L10–L14 teach subtraction and borrowing, L15 reviews both, L16–L19 introduce role-sensitive multiplication, and L20 mixes all three operations.

Run it locally:

```sh
cd number-garden
python3 server.py
```

Then visit `http://localhost:8080`. The standalone `index.html` can also be opened directly. On a new profile, choose `Start` or watch the guided `28 + 47` Tutorial. Tap coral-highlighted items in order. Addition and subtraction let you hold the active operand cell for 1.5 seconds to Drop All remaining items. In multiplication, the multiplicand stays still: tap multiplier Ones to pull complete copies into the product, hold the Ones cell to Pull All only that group, and explicitly tap each multiplier Ten to turn it into ten new Ones. Product regrouping is automatic and visible. Tap `?` to answer, or hold it to start Tutorial. Manual correct answers earn 10 coins and level credit; Tutorial awards neither.

The learner advances after either four current-level manual successes or two eligible higher-level manual successes. L14 and L19 gate the next mixed-review level, and L20 is the cap. Settings supports Standard/Easy difficulty, L1–L20 overrides, sound, reset, and About. Addition diagnostics default to `?a=58&b=47`; subtraction uses `?op=subtraction&a=42&b=17`; multiplication uses `?op=multiplication&a=12&b=23`. Forced problems are untagged, may earn the normal manual reward, and never earn level credit. Invalid subtraction order and multiplication products above 999 fall back to curriculum sampling.

Quick play defaults to `quickPlaySpeed=2`. The optional numeric URL flag accepts `0.5` through `4`; for example, `?quickPlaySpeed=1` restores the original three-second hold and `?quickPlaySpeed=4` shortens it to 0.75 seconds.

With the local server running, open `http://localhost:8080/tests/curriculum-harness.html` to run the deterministic curriculum and browser integration checks. The harness covers exact L16–L20 sampling boundaries, the 999 product cap, multiplication Pull All gates, automatic product regrouping, interruption, Tutorial, rewards, analytics, and all existing addition/subtraction behavior.
