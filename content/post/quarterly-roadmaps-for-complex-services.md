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
So I came up with some guiding principles to help me prioritize work in a way that keeps the system running, with hopefully fewer hiccups over time.   


### Strive for Simplicity

A core reason for a legacy service's complexity is that it has accumulated features and code over many years. The cognitive load of understanding such code is too high.
Perhaps the team has gone through a [Ship of Theseus](https://en.wikipedia.org/wiki/Ship_of_Theseus)-style turnover. 
Now no one knows what is important and what should have been removed two years ago. It is of course scary to make changes in code that is 
poorly understood, lest we inadvertently break something. 

One of the biggest own-goals a team can make is to continue maintaining dead features. Trying not to break something, that shouldn't
exist in the first place, incurs heavy cost: in terms of development effort and poor architecture decisions.   

So the first step towards taming complexity is to actively seek simplicity.

*   **Shed Deprecated Code:** If you already have a complex system at hand, try to get to the point where every line of code
is known to serve some useful purpose. Question every piece of obscure code. Talk to your clients: how are they using the information they consume
from your service. 
In a large distributed system it is quite possible that service A does some expensive computation to produce a result that it thinks
service B needs it. But service B had already sunset that feature, or moved to a different source.
So spend time identifying unnecessary code. Then delete, rinse, repeat. 
* **Reverse engineer:** Sometimes no one seems to know what's the purpose of a feature, be it the team owning the feature, its clients or relevant
stakeholders from the org. I'd go for deliberately breaking the feature in a controlled manner in a low risk environment, and perform chaos or A/B testing
to find out whether it will be missed.
*   **Re-evaluate the Data Model:** A service's data model should reflect its reality and scale. The choices made at the inception of a project may no longer apply
years down the line. It may be necessary to denormalize parts of the database, or switch to a different technology to improve performance and reduce complexity.
*   **Migrate Non-Core Responsibilities:** We all know SOLID, YAGNI, KISS etc. But 
A legacy system often accumulates responsibilities that don't belong to it. Be constantly on the lookout for opportunities to migrate non-core functionalities to other, more appropriate services.

### Always Be Migrating

Your service is a living system that is continuously piling up code, tech debt, and features. To keep it healthy, you must always be migrating: to newer library versions,
to technologies that make sense in the present.  

Is the service using the latest version of its database? Are its libraries up-to-date? Stability does not mean immobility. 
Newer versions often come with significant performance improvements and security patches. There may be new features in the latest version of your framework that you aren't aware of.
But using them may improve your API latency or reduce your operational cost. 

Check if your cloud provider is recommending any version upgrades. A resource that has reached the end of standard support may cost much more on extended support.

Sometimes cloud providers may perform mandatory upgrades to apply security patches. We learned this the hard way when AWS 
automatically upgraded some of our databases. Because the upgrade wasn't planned, it broke some dependencies causing production outage.




### Avoid Knowledge Silos

Sometimes a component is so mature and stable that there is no need to make any modifications on it. Consequently, the team's knowledge of how it works can fade over time
because there has been no need to visit that part of the codebase. 
This creates a significant risk. To combat this, a few practices can be implemented:

*   **Rotate Maintenance and Upgrade Tasks:** Letting each team member take turns to own such tasks ensures that they all 
have at least a basic competency with every aspect of the service. The same applies to other initiatives and features.
*   **Build Gameday Scenarios:** Regularly conduct "Gameday" exercises, simulating failures in obscure parts of the system. 
This helps build confidence in the team's ability to handle real-world incidents.

### Improve Observability

Often, monitoring for legacy systems is based on arbitrary system-level metrics like dead tuple counts in a database. This can lead to alerts that don't correlate with any actual customer impact. A deliberate shift to a more customer-centric approach to observability is required.

*   **Define SLOs for all User Flows:** Start by defining Service Level Objectives (SLOs) for all critical user flows. This forces a discussion about what a good customer experience looks like in measurable terms.
*   **Alert on Burn Rate:** Instead of alerting on noisy, low-level metrics, alert on the burn rate of the SLOs. This ensures that teams are only paged when there is a real and sustained impact on customers.

Managing a legacy system is a marathon, not a sprint. The principles outlined here are not a silver bullet, but they provide a framework for making steady, incremental progress. By embracing simplicity, continuous migration, knowledge sharing, and meaningful observability, any team can turn an unreliable legacy system into a stable and evolving product to be proud of.