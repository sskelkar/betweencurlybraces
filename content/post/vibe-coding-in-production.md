---
title: "Vibe Coding in Production: Early impressions"
date: 2025-08-23T21:00:00+02:00
draft: false
tags:
  - Agentic Coding
---

For the past few months I have been trying to incorporate agentic coding as much as possible in my daily workflow. 
So this is a good time to pause and reflect on some early impressions of using AI.

**1. "A sword is only as good as the person who wields it."** While working on a software project you learn a lot 
and develop a style of doing things, subconsciously, without realizing. With an agent you have to recall everything. 
AI is like an enthusiastic but careless junior developer. You don't automatically trust everything it proposes just like you wouldn't blindly trust an inexperienced
engineer who is new to your project.

As programmers, we work in a rhythm of writing the code, unit tests and verification.
The same process has to be articulated in a prompt so the AI follows the same process as us.
There is a cycle of clarifying requirements, breaking down into steps, gradually rolling out in backward compatible releases, small self-contained readable PRs. 
All of this still applies with agentic coding.

So the hard won lessons that we have learnt over the years about running software on production reliably remain as relevant as ever.
We just need to port our way of working over to AI.

In conclusion, I do believe there's a way of responsibly working with AI agents on serious production apps. The "AI deleted my 
database" fears seem to me a bit overblown. But teams need to be careful with their prompts and not expect AI to work like magic. 

**2. Manual review remains the limiting factor.** Any new code in my project, whether or not AI generated, must pass at least one manual review. Even if a pull request
is fully vibe coded, it must fulfill certain criteria:
   - It should be easy to review, i.e. must not be too big or complex
   - The code should be readable  
   - No edge cases must be overlooked
   - Full context should be provided, so that the change is easy to understand to someone reading it in the future
   - It should be self-contained. Relevant unit tests must have been written. Documentation updated, comments added etc.

The point is, with agentic coding, it is possible to produce a lot more code than before in a unit of time. But at least for now, manual review throttles 
how quickly it can be deployed to production on my project.

**3. Terminal is where it's at.** I mostly concur with Steve Yegge's pronouncement that the [IDE is dead](https://sourcegraph.com/blog/the-brute-squad). 
With agentic coding tools like Gemini CLI and Claude Code, terminal is where the business happens. I spend my time working through the terminal - prompting specs, reviewing, approving
or simply Yolo-ing. I still use the IDE for its code navigation features, but mostly to keep a tab on what AI is producing. So for me, IDE is now a tool to read code
rather than write it.

**4. Coding is a writing job, more than ever.** At some level, coding was always about being able to write well structured code that is easy to read
and maintain. Apart from code, engineers were supposed to write RFCs and ADRs for their major work. But with AI, we are supposed to be writing
prompts that are complete, coherent and logically consistent, so that the AI doesn't go awry. While AI agents do help write the prompt, 
it seems to me that folks with some writing skills may have an edge. 



Lastly, does AI make development faster? As it turns out, it can have quite the [opposite effect](https://www.reuters.com/business/ai-slows-down-some-experienced-software-developers-study-finds-2025-07-10/).
Even the point of this post has been about doing things right, rather than doing it fast. On the topic of speed, I like what the 
CEO of Github [wrote](https://ashtom.github.io/developers-reinvented):
> Developers rarely mentioned “time saved” as the core benefit of working in this new way with agents. They were all about increasing ambition. 

I am still figuring it out. But AI coding looks promising, and I'm going to continue experimenting with it. 
