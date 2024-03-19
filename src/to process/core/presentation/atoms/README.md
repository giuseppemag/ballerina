# Atoms

## Definition

Atoms of our interfaces serve as the foundational building blocks that comprise all our user interfaces.

### Atom must:

- Building blocks of an interface
- Can't be broken down any further without losing their meaning
- Often not to useful on their own
- Good as an at-a-glance reference

### Abstraction atom components

There are time that we still want to use a pretty simple component like BaseInput with predefined values like placeholder, icon. In that case we can still predefine those values, add a BaseIcon to this component and change the name to BaseSearch component for e.g. This STILL will be considered as an ATOM.

## TL;DR

The smallest of all components, allow for some props values, shouldn't contain any other import of another component.
As simple as possible.
