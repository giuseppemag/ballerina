---
marp: true

---

<!-- theme: gaia -->
<style>
  :root {
    --color-background: #3A36AE;
    --color-foreground: #FCEEF5;
    --color-highlight: #E0569B;
    --color-dimmed: #E0569B;
    /* --color-background: #487ced;
    --color-foreground: #ffedf5;
    --color-highlight: #ffedf5;
    --color-dimmed: #ffedf5; */
    /* --color-background: #ffedf5;
    --color-foreground: #000444;
    --color-highlight: #487ced;
    --color-dimmed: #487ced; */
    /* --color-background: #083d34;
    --color-foreground: #e3e8e7;
    --color-highlight: #35a674;
    --color-dimmed: #35a674; */
  }
</style>

# Tech strategy 2024-2026
By Dr. Giuseppe and the TLT

---

# The goal
Achieve near-perfect _versatility_ and _resilience_ in the technology we use.

Have a fully self-managed team that can maintain our technology proactively.


---

# Versatility
Ability to adapt to 
- changing wishes of clients
- changes in technology
- changes in the market

---

# Versatility and finance

Versatility makes it possible to become _hyper productive_ (billability higher than 100%) and achieve _higher efficiency_. 

Versatility creates financial room to being more resilient.

---

# Resilience

Ability of the organization to sustain technical challenges:
- speed
- SEO performance
- security
- bugs.

---

# Resilience and operations

We change things all the time with as little budget as possible: we need high resilience out of the box.

Resilience costs efficiency in the short term (more structures and quality controls) but enhances in the medium to long term.

---

# Proactive maintenance of the Black Box Cluster (BBC) of dev and dev ops

Tech gets more complex by the year. 

Maintaining our technical toolbox is more than ever a black box for the rest of the organization.

Example: knowing what a ssh tunnel is needed to determine how the VPN access to the production cluster works. 

We want to balance self-management of the TLT with transparency and strategic coordination with the rest of the org.

---

# The strenght...

...of the shield is never greater than the strenght of the arm holding it

Training plays a central role in our vision. High versatility and resilience come at a cost: technical complexity. This requires excellent knowledge.

---

# Concretely
We have a bunch of concrete things in mind for versatility, resilience, and training.

---

# Versatility
-	Standardize modules and interfaces as much as possible
-	Standardize connectors (adapters) between modules
-	Define dynamic switches to easily turn on or off modules
-	Extend standardization to more aspects of how we work (for example, coroutines for concurrent or incremental processing)
-	Continue merging codebases into monorepos to reduce replicated maintenance
-	Adopt SaaS/low-code/no-code tools to support our bigger digital transformation by flanking pro-code solutions (HubSpot/PowerPlatform/…) .


---

# Resilience
To achieve resilience, we want to:
-	Add more battle-tested components that work well out of the box (including improved components for the non-functional requirements: SEO, security, unit testing, etc.)
-	Add automated testing for security
-	Add automated testing for performance/load testing
-	Add monitoring infrastructure for security
-	Add monitoring infrastructure for performance/load testing
-	Add granular monitoring as far as possible, at least for the database servers
-	Add a disaster recovery cloud spill-over infrastructure
-	Remove the dependency on the VPN for accessing dev machines and production infrastructure
-	Add 2FA to all critical infrastructure, connected to Azure/Entra
-	Improve partitioning of access on live infrastructure
-	Continuously refactor existing projects to newer standards


---

# Training
The courses are more "why" than "how", to gain a deeper level of understanding of the concepts explained in the lessons. 

This also means that a considerable time investment is required to get actual value out of the academy. 

Therefore, (senior) people will be selected and trained to distribute the knowledge better, which is the long-term goal of the academy.


---

# By tech/operational area
We have some thoughts on how to achieve V&R per technical/operational area.


--- 

# AI
We will move towards ML, recommender systems, as well as adopting existing tooling such as ES-powered semantic search.


---

# CMS

Headless is here to stay, flanked by SaaS tooling such as HubSpot CMS next to our headless stack.

Anything complex will go to our headless stack, with cross linking to the SaaS website.

---

# Shopify

E-commerce will be centered around Shopify, both SaaS and headless through the DTP.


---

# DTP frontend

The DTP will be focused on building the CX only (thus, limited to TS/Rx/CSS) and make a stand on what the Hoppinger Digital Transformation really is, from website to e-com, e-learning, community, subscriptions, and more.

It is time to leverage the much needed synergy between business, design, and tech with design in the spotlight.


---

# 