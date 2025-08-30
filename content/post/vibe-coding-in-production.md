---
title: "Vibe coding in production"
date: 2025-08-23T21:00:00+02:00
draft: true
---

For the past few months I have been trying to incorporate agentic coding as much as possible in my daily workflow. 
So this is a good time to pause and reflect on some early impressions of using AI.

**1. "A sword is only as good as the person who wields it."** While working on a software project you learn a lot 
and develop a style of doing things.  
subconsiously, without realizing. With an agent you have to recall everything 
AI is like an enthusiastic but careless junior developer. You don't automatically trust everything it proposes just like you wouldn't blindly trust an inexperienced
engineer who is new to your project.
TODO
- rhythm of writing the code, unit tests and veification
- and articulate in a prompt so the ai follows the same process
- the cycle of clarifying requirements, breaking down into steps, gradually rolling out in backward compatible releases, small self-contained readable PRs. 
All of this still applies with agentic coding.
**2. Manual review remains the limiting factor.** Any new code in my project, whether or not AI generated, must pass at least one manual review. Even if a pull request
is fully vibe coded, it must fulfill certain criteria:
   - It should be easy to review, i.e. must not be too big or complex
   - The code should be readable.  
   - No edge cases must be overlooked
   - Full context should be provided, so that the change is easy to understand to someone reading it in the future
   - It should be self-contained. Relevant unit tests must have been written. Documentation updated, comments added etc.

The point is, with agentic coding, it is possible to produce a lot more code than before in a unit of time. But at least for now, manual review throttles 
how quickly it can be deployed to production on my project.

**3. Terminal is where it's at.** I mostly concur with Steve Yegge's pronouncement that the [IDE is dead](https://sourcegraph.com/blog/the-brute-squad). 
With agentic coding tools like Gemini CLI and Claude Code, terminal is where the business happens. I spend my time working through the terminal - prompting specs, reviewing, approving
or simply Yolo-ing. I still use the IDE for its code navigation features, but mostly to keep a tab on what AI is producing. So for me, IDE is now a tool to review code
rather than write it.

**4. Code is cheap.**  When a company's management starts investing in AI tools for its engineers, they want to know if features can be shipped more quickly. 
After all, tokens aren't cheap. 

So does AI make development faster? As it turns out, it can have quite the [opposite effect](https://www.reuters.com/business/ai-slows-down-some-experienced-software-developers-study-finds-2025-07-10/).
Even the point of this post has been about doing things right, rather than doing it fast.  


