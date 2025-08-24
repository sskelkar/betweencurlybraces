---
title: "Software tenbagger"
date: 2025-05-12T21:02:00+02:00
draft: false
tags:
- Coding is fun
- Database
---

"Tenbagger" is a term coined by legendary investor Peter Lynch to describe stocks that provide tenfold value on the initial investment. 
As software engineers we make scores of decisions every day in the face of ever-evolving requirements, whose impact on the architecture might only become visible down the line.
It's nice when a relatively low-effort code change ends up providing compounding benefits over a long time horizon.

I am currently working on a critical component in a distributed system for a food-delivery app. One of its core responsibilities is to receive information from an upstream service and
pass it into downstream services. The feature requirements typically follow this pattern: customers can now provide a backup phone number, which should be shown on the delivery app.
So an order passing through a chain of systems can now contain a new field, which needs to be forwarded to relevant downstream services. 

Because we use Postgres for data storage, whenever a new feature like this came up, we'd add a new column to our `customers` table. This required a database migration, which is usually
not a big deal. But as our operations grew, to keep up with the increased scale, we had to partition our tables. Increase in business also meant that we were serving orders 24x7.
So there was no time window to safely run migrations. Since an `ALTER TABLE` statement typically needs to acquire lock on a table, our migrations were becoming increasingly risky
as they could interfere with live operations and sometimes cause a small downtime. 
Whenever a similar requirement came up, having to add a new column would itself become one of the steps in the implementation plan. This meant that any code change to read a new column 
could not be rolled out before the column itself was added.

We noticed that while we were collecting ever more customer information, there was no use case to query the customers based on it. These new columns did not appear in 
any `WHERE` clauses and didn't need to be indexed.

So finally we introduced a `jsonb` metadata column. Anytime we need to store any new information, we just stick into this jsonb column. No more new risky database migrations. 
Feature rollout is smooth, safe and _fast_.   

Like a true tenbagger, this small change has proven its value in several new feature requests already. Effort estimations are shorter and the velocity has improved.