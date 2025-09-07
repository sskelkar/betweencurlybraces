---
title: "Keeping the Lights On: A Manager's Guide to Legacy Services"
date: 2025-09-07T00:00:00+05:30
draft: false
author: "Sojjwal Kelkar"
tags:
- Manager
---

Last year I transitioned to the role of engineering manager on a complex, legacy service with a poor reliability record. 
As a first time manager it is quite a challenge to plan a roadmap that can balance tackling reliability issues and reducing technical debt on one hand, and building
new features on the other.

The developer time is a very precious resource. As a manager, you want to spend it in a way that produces compounding benefits over time. 
So I came up with some guiding principles to help me prioritize the right tasks to keep the system running, with hopefully less hiccups over time.   


### Strive for Simplicity

A core reason for a legacy service's complexity is that it has accumulated features and code over many years. The cognitive load of understanding such code is too high.
Perhaps the team has gone through a ship of Theseus style turnover. So no one knows what is important and what should have been removed two years ago.  
One of the biggest own-goals a team can make is to continue maintaining dead features. So the first step towards taming complexity is to actively seek simplicity.

*   **Shed Deprecated Code:** Legacy systems are often burdened with deprecated code.   
*   **Re-evaluate the Data Model:** A service's data model should reflect its reality and scale. The choices made at the inception of a project may no longer apply
years down the line. It may be necessary to denormalize parts of the database, or switch to a different technology to improve performance and reduce complexity.
*   **Migrate Non-Core Responsibilities:** We all know SOLID, YAGNI, KISS etc. But 
A legacy system often accretes responsibilities that don't belong to it. Be constantly on the lookout for opportunities to migrate non-core functionalities to other, more appropriate services.

### Always Be Migrating (Stability ≠ Immobility)

One of the biggest fallacies when dealing with a legacy system is to equate stability with immobility. 
Your service is a living system that is continuously accumulating code, tech debt, and features. To keep it healthy, you must always be migrating - to newer library versions,
to technologies that make sense in the present. 

*   **Stay Current with Dependencies:** Is the service using the latest version of its database? Are its libraries up-to-date? 
Newer versions often come with significant performance improvements and security patches. There may be new features in the latest version of your framework that you aren't aware of.
But using them may improve your API latency or reduce your operational cost. Check if your cloud provider is recommending any version upgrades. 
*   **Address Security Vulnerabilities:** Your external libraries can have security vulnerabilities. Staying on top of these and patching them is critical for any service, but especially for one that is business-critical.

### Avoid Knowledge Silos

Sometimes a component is so mature and stable that there is no need to make any modifications on it. Consequently, the team's knowledge of how it works can fade over time
because there has been no need to visit that part of the codebase. 
This creates a significant risk. To combat this, a few practices can be implemented:

*   **Rotate Maintenance and Upgrade Tasks:** Rotate ownership of maintenance and upgrade tasks to ensure that every member of the team has at least a basic competency with every aspect of the service.
*   **Build Gameday Scenarios:** Regularly conduct "Gameday" exercises, simulating failures in obscure parts of the system. This helps build confidence in the team's ability to handle real-world incidents.

### Improve Observability

Often, monitoring for legacy systems is based on arbitrary system-level metrics like dead tuple counts in a database. This can lead to alerts that don't correlate with any actual customer impact. A deliberate shift to a more customer-centric approach to observability is required.

*   **Define SLOs for all User Flows:** Start by defining Service Level Objectives (SLOs) for all critical user flows. This forces a discussion about what a good customer experience looks like in measurable terms.
*   **Alert on Burn Rate:** Instead of alerting on noisy, low-level metrics, alert on the burn rate of the SLOs. This ensures that teams are only paged when there is a real and sustained impact on customers.

Managing a legacy system is a marathon, not a sprint. The principles outlined here are not a silver bullet, but they provide a framework for making steady, incremental progress. By embracing simplicity, continuous migration, knowledge sharing, and meaningful observability, any team can turn an unreliable legacy system into a stable and evolving product to be proud of.