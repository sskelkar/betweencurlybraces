---
title: "Mimicking developer cognitive process with agent teams"
date: 2026-05-26T00:00:00+05:30
draft: false
author: "Sojjwal Kelkar"
tags:
- Agentic Coding
share_img: ""
---
Agentic coding came with the promise that developers could spend their time thinking at a higher abstraction, as the task of writing code is delegated away. 
Instead, what we observe is that for any non-trivial task, developers have to spend their time micromanaging AI to ensure that it is being thorough enough and doesn't overlook any critical requirements.
In serious projects with strict quality requirements, any velocity gained by speedy AI-generated code can get offset by the burden of monitoring, verification and code reviews. 

There are two major reasons why AI struggles to get it right:
* ### AI operating on incomplete information
   Sure, we have added `claude.md` and extensively documented the project rules. But not everything that a human does while writing 
code can be captured in these documents. Just like a new engineer joining a team learns about the product, codebase, deployment 
constraints, common failure modes and team preferences etc. over time by building (and breaking) things; AI agents also somehow need to accumulate 
learnings, recognize patterns and recall specific information when needed, such that the need for explicit prompting can go down.

   Because even if it was possible to provide upfront documentation for everything, loading it all up leads to context bloat, which brings us to the next problem.
* ### Tendency of AI to forget its instructions
   We can provide an instruction clear as daylight, but there's a chance that the AI agent can simply ignore it.

   This limitation of LLMs is well explained in [this Anthropic blog](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents):

   > [...] we’ve observed that LLMs, like humans, lose focus or experience confusion at a certain point. Studies on needle-in-a-haystack style benchmarking have uncovered the concept of context rot: as the number of tokens in the context window increases, the model’s ability to accurately recall information from that context decreases.
   >
   > [...] Context, therefore, must be treated as a finite resource with diminishing marginal returns. Like humans, who have limited working memory capacity, LLMs have an “attention budget” that they draw on when parsing large volumes of context. Every new token introduced depletes this budget by some amount, increasing the need to carefully curate the tokens available to the LLM.

Other more [insidious issues](https://www.reddit.com/r/ClaudeCode/comments/1rug14a/claude_wrote_playwright_tests_that_secretly/?utm_source=chatgpt.com) have been observed where agents can manipulate unit tests or requirements to fit the implementation.

Which means engineers must babysit AI agents to ensure they are doing the right thing. But we don't want to micromanage. 
No, we want to YOLO when vibe coding, but... safely.

# [How humans develop software](#how-humans-develop-software)

Good software developers don't just naively implement a ticket assigned to them. They add value through their knowledge and experience.
They question the requirements. They think about edge cases and anticipate failure scenarios.
They are discerning and push back on introducing changes that can break any implicit or explicit constraints,
duplicate a feature or violate domain boundaries.
They know how their services interact with each other. 
How the data being produced in one service is used by another. How a few lines of code can impact the customer experience. 


Developers remember how a new release had broken production last quarter. How to safely roll out a large code change 
in a backward compatible manner. Or what technical debts exist in the system. Beyond functionality, they know the coding style and preferences of their team. 
In short, humans utilize their institutional knowledge to exercise taste and judgement.

Having said that, humans are not infallible. People complain that AI is non-deterministic. But so are we. 
Humans experience fatigue, cognitive load, simple forgetfulness or not being able to make connections when information is provided
in a different context. All of which can lead to what we call "human errors". So just like we manage our expectations and 
build safety mechanisms to work around human limitations, we need to do the same with AI.
# [What is an agent team?](#what-is-an-agent-team)

It is an [experimental Claude feature](https://code.claude.com/docs/en/agent-teams) where we can spin up multiple agents within the same session. Unlike subagents, 
that can only report back to the main agent, the agent 'teammates' can talk to each other live using the `SendMessage` tool. 
Each agent has its own context window, instructions, configuration and model. They live in their separate tmux pane, 
where the user can interact with them individually.

These agents can take on predefined subagent types or personas. Each agent type also maintains its separate memory where 
it can store its learnings. We can make the agents self-reflect after a session. So just like a human developer, 
the agent can gradually accumulate knowledge that can be lazy loaded depending on the situation. 

# [The Agent Categories](#the-agent-categories)

Now I present four agent categories or archetypes who, when working together, can crudely mimic the human cognitive process described above. 
When building an agent-team, each archetype can be represented by a single agent with broad set of responsibilities, or 
multiple fine-grained agents.

## [The Spec Owner](#the-spec-owner)

Its primary responsibilities are:

### Creating the requirement spec
The spec owner agent works with the human to produce a clear spec that has taken into account not only the new requirements, 
but also a holistic understanding of the system that's typically not present in a Jira ticket (see [The Knowledge Keeper](#the-knowledge-keeper)). 
It should interview the human developer and help them think through different aspects of the problem statement - possible edge cases, 
inputs and outputs, public contracts and impact on the current product flows etc.

This spec should ideally be a structured prompt, like a [Product Requirement Prompt](https://sskelkar.github.io/post/prompts-capture-intent-like-never-before/#product-requirement-prompts). Each functional requirement is 
given a unique identifier that would help in cross-referencing it with the implementation.

It is important to note that the spec being produced by this agent only reflects the information known during 
the requirement gathering process. It can be iterated upon with the help of other agents as more information becomes available. 
For eg, the Implementor can contest the requirement if it finds something that doesn't make sense in its code walkthrough. 
Any conflicts bubble up to the human, who must decide what should be built.

In a multi-agent team, this agent has the sole access to modify the spec. It operates on a project directory to which no 
other agent would have the write access. Therefore, it can be the gatekeeper for the human-approved spec. 
Other agents can dispute the requirements laid out in the spec, but they cannot silently modify it without the knowledge of the human engineer.


### Code review
After a human has approved the spec, it is sent to the implementor agent. When the implementor reports that the task is done, 
the spec owner reviews the code and the unit tests to verify its adherence to the requirement spec. 

If it detects any issues it can message the Implementor to fix it. Otherwise, it approves the code to go to the next checkpoint.

There can be situations where there's no real requirement spec, for example, when we are refactoring some code rather than 
introducing a new functionality. In such situations, this agent can just document some invariants that shouldn't break 
as a result of the refactoring. So the job of the Spec Owner is slightly different because there's no 'spec' to be owned. 
Its primary role is of the code reviewer who ensures that the refactoring hasn't caused any feature or data regression.

## [The Implementor](#the-implementor)
As the name implies, this agent must correctly implement the requirements while upholding code quality. 
It must read the style guides, code conventions and all HOWTO docs on how code is organized in the project. 

Before starting to write code it should produce an implementation plan (IMPL) and get it reviewed by the developer.
To write this doc, first it must deep dive into the code to check the feasibility of the solution it is proposing. The IMPL doc should include:
- A listing of how each requirement will be implemented and verified
- The assumptions that the agent is operating under
- Any alternative solutions considered, with trade-offs
- An architecture diagram of its proposed implementation. This can be a simple ASCII or Mermaid class diagram or a detailed UML diagram. This way the developer can get an idea of what the implementation will look like before the code is written
- Edge cases it has considered
- Any open questions for the developer

During its code exploration phase, it can flag any discrepancies in the requirements. Our goal is to gather as much information upfront 
as possible. Because the later we discover issues, the more expensive it gets to change the code in terms of time and tokens.

The implementor has a strong post-session self-reflection protocol where it tries to capture every preference expressed by the human 
that wasn't present in the project guides. It indexes all the information and can load it on demand. 
The memory feature comes with great promise that can gradually reduce the amount of management these agents need. 
However, memory bloat is also a concern. So periodic review and compaction might be needed. I'm still experimenting with this 
feature to learn how well this actually performs.

## [The Knowledge Keeper](#the-knowledge-keeper)
This agent creates a Andrej Karpathy's [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)-style documentation of a project that:
* provides a blackbox understanding of the project
* captures 'institutional knowledge' that is not present in the code

The knowledge collected by it is supposed to function like a second brain, relieving the developer from having to remember every tiny detail. It provides value by:
### Gathering knowledge
It collects all knowledge related to a project that can be difficult to express in the code. It can document:
- Product flows: Business-centric doc that helps the reader understand what the service does
- External dependencies: What can break in service X if we stop publishing Y
- Data contracts: What's coming in. What's going out. What's getting stored.
- Configurations: Which flags need to be set to enable a feature

Its mandate is to:
- Not duplicate the code in the documentation
- Interview the human to capture as much institutional knowledge as possible
- Never assume things. Always clarify.

To create the documentation we can start a standalone Claude session with the knowledge keeper as the main agent. 
We ask it to document some flow and give it a starting point reference in the code. The agent will read the code, comments, 
unit tests etc. to create the doc. The human should be actively involved in the documentation process by reviewing agent's work, 
fixing terminology, providing additional context that's not present in the code. The reviewer should look out for any leaps 
made by the agent. We want the language in the doc to match how the product folk and the team speaks, rather than 
it reading like AI slop.

This agent can collect additional information like the commit hash and timestamp of the code that was used to create the doc. 
So we can get a sense of how fresh the documentation is. 
In my team, we prefer to keep this agent's documentation within the project repository]. It might also be a good idea if the 
Product Manager, rather than a developer creates this doc.

### Sanity checks in an agent team session
This agent is not just a passive documenter. In an agent team session, it can play an interesting role.
- First the Spec Owner uses its documentation to get some product context when writing the spec document.
- When the Spec Owner's doc is ready, the Knowledge Keeper can read it to determine what kind of change is being introduced to the system. It basically compares the spec with its own documentation. It should remember this diff in a structured format.
- When the Implementor has written the code, the Knowledge Keeper is notified again. It reads the code changes and determines how it is changing the product flows. It again takes a structured diff.
- Then it can compare the spec based diff and the implementation based diff to detect whether the implementation has drifted away from the requirements. Thus, it is yet another agent in the loop who's reviewing the code and providing timely feedback.
- Lastly of course, this agent updates the documentation at the same time when new code is being written, thereby solving the perennial struggle to keep the documentation up to date.

To get the diff checking benefit out of this agent, before starting a team session, I do a short run with this agent to update its documentation or create it if there was none.

## [The Orchestrator](#the-orchestrator)

The agents described so far are specialists, that can be used standalone. For example, instead of working with the default Claude agent, we can start a session with a developer (`claude --agent developer`) and benefit from its accumulated learnings.

But to make them work as a team, we need a lead agent to orchestrate the flow. The orchestrator knows in which order the information is transmitted between the agents. It can review docs and code produced by the other agents. It mediates disputes, keeps tracks of retries to prevent the agents from circling endlessly, and escalates to the human if the team is not able to progress for some reason.



## [Helper agents](#helper-agents)
The point of the agent team is to keep the context of the primary agents focussed on their job. Therefore, any task, tool calls, 
research etc. that may have a potentially low signal-to-noise ratio must be kept out of their context windows. This is where helper agents come in. A primary agent can delegate the grunt work to a helper agent and only get back compact result that is strictly relevant to it. These are simple agents that can run on cheaper models.

For example, we use helper subagents to run unit tests en-masse as the final verification step of the feature implementation. 
A unit-test-runner subagent only reports back the failures.

There are also tools like [rtk](https://github.com/rtk-ai/rtk) that perform a similar function. But depending on the task at hand or compatibility of your stack with `rtk`,
a helper agent might be preferable.

# [How it all comes together](#how-it-all-comes-together)

At bootstrap, in addition to the common instructional files like `claude.md`, each agent loads its own specific instructions 
and unique memory. Meaning they are operating with different contexts and points of view. Agents can keep each other accountable 
by performing adversarial reviews on their outputs. All of this improves the probability that the code produced by an agent team 
session doesn't miss an important detail, that a single agent might. The Spec Owner will inform the Implementor if the latter missed implementing some requirement. If the Implementor discovers some undocumented behaviour during its code walkthrough, it informs the Knowledge Keeper to update its documentation.

Each agent also interacts differently with the user, meaning they can help the human developer think through different aspects of a problem. 
They can also help fill in the gaps if the developer doesn't know certain aspects of the project or cannot recall details at the moment.

As per Claude documentation, agent teammates shouldn't edit the same file because it can lead to overwrites. I think this is actually a feature not a bug. 
Each agent has edit permission to different parts of the project. Which means the Implementor can’t silently alter the requirement. 
Changes to the spec go through the Spec Owner. And Spec Owner's mandate dictates that all edits to the spec require human approval.

While I have described broad agent personas here. In practice multiple specialist agents can be used for better context control. 
For example, instead of a single implementor agent having to know everything detail about how human developers prefer to write 
code on a project, we can split the role into specialists who review the code and provide feedback: one has thoroughly understanding 
of the project architecture; another is a clean coding practitioner; and yet another can be the reliability expert who has been 
trained in the last twenty incident reports and knows all the common failure modes. In other words, the **Single Responsibility Principle**, applied to AI agents. 

Finally, not everything has to be an AI agent. Remember, context is a finite resource. So we need to offload any responsibilities that can be achieved by static code analyzers.

# [But what about the cost?](#but-what-about-the-cost)

At first look, a multi-agent setup seems more expensive than a single agent. But it's not a given. Instead of using one big 
powerful agent, we have divided its job to multiple specialized agents that work on a smaller problem space. Because each agent 
is only solving a part of the problem, it is possible to use cheaper models for them. So the overall cost of an agent team session may turn out to be 
comparable or even lower, to using a single agent on a bigger model.

Companies have made a similar trade-off before with pair programming. If two engineers together work on the same ticket 
instead of one, it seems like doubling the cost. But it can also mean higher quality and faster delivery because 
there is less probability of rework and delays if feedback comes during implementation, rather than during code review.

In the end it's not just about what is cheaper, but what provides the most value for money.

# [So how does this change the Developer Experience?](#so-how-does-this-change-the-developer-experience)

Before AI, there was a limit on how much planning and collaboration developers could do. Because the clock is ticking, 
at some point, you needed to stop talking and start coding. AI automates the typing, but still consumes developer time to keep 
the outcome deterministic. 

A team of specialized agents with intricate knowledge of our project and our way of working _can_ improve confidence by 
injecting early feedback from multiple points of view. They may even help deliver robust software by filling in the gaps in the developer's knowledge.

If the code passes through multiple rounds of agentic reviews: adherence to requirements, congruence with the project, coding style, reliability, unit test quality etc.,
when AI claims to have done something, we can trust that it probably has. This should reduce the burden of pull request reviews.    

All of this means that the developers get to spend more time upstream to collaborate on 
architecture, code structure and deciding the right abstractions. The sheer speed by which code can be produced with AI means that 
once a poor architectural decision goes uncorrected, its impact can stack up really fast. This is why as someone who's 
responsible for maintaining a critical legacy system, I believe the need for close human collaboration has never been higher.

# [Are agent teams effective?](#are-agent-teams-effective)
At its core, a multi-agent team setup is a form of [agentic harness](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents).
I'm experimenting with different agent team configurations on refactoring a complex legacy system that has a lot of external [dependencies](https://www.explainxkcd.com/wiki/index.php/2347:_Dependency).
So far it appears that for really hard problems, agents with more granular responsibilities may perform better.
The idea of agent teams is promising, but it requires more stress testing on real-world problems.

Ultimately, we desperately need to have more reliable agentic setups that don't incur a high cost of human verification.
The pattern of distributing developer judgment across specialized
agents deserves serious exploration. It might be the way forward.