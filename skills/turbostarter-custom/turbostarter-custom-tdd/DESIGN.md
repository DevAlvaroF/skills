# Designing the interface

Consult this when the shape of an interface is itself in question: how deep the module is, where its seam goes, what it
exposes. It is a reference, not a session to run, and the user still settles the answer before the test is written.

## Depth is leverage

A **module** is anything with an interface and an implementation: a function, a class, a package, a slice across tiers.
Its **interface** is everything a caller must know to use it correctly: the types, and also the invariants, ordering
constraints, error modes, required configuration and performance characteristics.

A module is **deep** when a lot of behaviour sits behind a small interface, and **shallow** when the interface is nearly
as complex as what it hides. Depth is leverage: callers and tests exercise more behaviour per thing they have to learn,
and change, bugs and verification concentrate in one place. When shaping an interface, ask whether it can have fewer
entry points, simpler parameters, or hide more.

Depth is a property of the interface, not the implementation: a deep module can be built from small, swappable parts as
long as they stay out of its interface. The interface is the test boundary too. Callers and tests cross it in the same
place, so a test that needs to reach past it says the module is the wrong shape.

## The deletion test

Imagine deleting the module. If its complexity vanishes, it was a pass-through: fold it into its callers. If the
complexity reappears across its callers, it is earning its keep.

## One adapter means a hypothetical seam

A **seam** is where a module's interface lives: a place where behaviour can change without editing there. An **adapter**
is a concrete thing that satisfies the interface at a seam. One adapter means a hypothetical seam; two (typically
production and a test stand-in) mean a real one. Don't add a port or an injected dependency unless something actually
varies across it: a single-adapter seam is just indirection. Where a dependency has a local stand-in (an in-memory
store, a local database), run it in the test and keep the seam internal; inject a port only for what the test can't
run, per [mocking.md](mocking.md).

## Design it twice

Your first interface is unlikely to be the best. When the shape matters, sketch two or three radically different ones —
the smallest that could work, the most flexible, the one that makes the commonest call trivial — each with a usage
example and what it hides. Compare them by depth, by where change would concentrate and by where the seam sits, then
recommend one, or a hybrid, and let the user choose.
