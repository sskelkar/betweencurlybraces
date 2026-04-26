---
title: "Well structured prompts capture intent like never before"
date: 2025-09-10T00:00:00+05:30
draft: false
author: "Sojjwal Kelkar"
tags:
- Agentic Coding
---
It's been about two months since my team started using Gemini as part of their daily coding workflow. 
We observed that while AI is powerful, it requires some effort to keep it aligned with our requirements, lest it runs amok.

When we simply gave it a problem statement and let it work, the output was sometimes not what we wanted to achieve. 
Our simple prompts failed to specify constraints, conventions, and success criteria. Gemini was making assumptions that didn't match our expectations.

It would be tempting to declare AI as not very smart. But what it's able to do is so impressive that it would have been scarcely believable just a couple of years ago. 
When we thought about what was going wrong, we realized it wasn't very different from what might happen with an inexperienced developer who is new to a codebase.

## [Product Requirement Prompts](#product-requirement-prompts) 

A more systematic approach to prompting was required. The answer turned out to be so simple, we have been using it all along. 
It just took some time to realize that the same approach is needed with AI: [Product Requirement ~~Document~~ Prompts](https://github.com/Wirasm/PRPs-agentic-eng).

In a normal workflow, we don't jump to coding as soon as we hear a problem statement. 
We gather all the requirements, understand them thoroughly, and decide on acceptance criteria. 
Then the developer creates a written or mental plan of how to implement the feature. 
Only after all of this preprocessing is the actual code written.

Now when a developer uses Gemini to build a feature, the first few minutes are spent creating a plan document. 
The PRP doesn't need to be written manually. Gemini helps write it. 
The developer iterates over it with Gemini until all the requirements, implementation steps, and success criteria have been clearly documented. 
Any background information on the feature is also added to the document.

The PRP may contain a list of implementation steps. As Gemini runs through each step, it can update their status.

## [Yes, You Should Check in the PRP](#yes-you-should-check-in-the-prp)

There was some debate in the team about what to do with these PRPs once the implementation was done. One camp argued for discarding the plan because it's not code. In the first few weeks when we started agentic coding, our general understanding was that AI-generated code should be indistinguishable from human written code. The intention being that AI written code should match the quality of human code. Checking in the PRPs gave it away!

There were also more practical concerns: PRPs accumulating over time and increasing clutter, and PRPs being a development-time artifact that would soon become outdated as new code is written.

While these concerns made sense, I saw value in keeping the PRPs around, at least for the time being. Since we were gradually transitioning to the Gemini way of working and still learning, I thought it was too soon to declare what constituted a good practice.

As we transition to PRP-based Gemini usage, having them in pull requests or the codebase is valuable for knowledge sharing as a way of showing what a good prompt looks like. Our approach will evolve, and we'll learn from each other with every PR. They're also useful as a reference for junior engineers. For this purpose, committing them to a dedicated folder is the most convenient approach, rather than copying and pasting them elsewhere.

If the PRPs turn out to not be useful, we can easily delete them later.

Some tickets require changes large enough that they should be deployed in multiple steps, rather than one huge diff. The PRP also serves as a persistent prompt that's readily available when we want to continue working on a ticket. In each session, we can ask Gemini to check the current state of the PRP and continue where it left off.

## [Capturing Intent and Thought Process](#capturing-intent-and-thought-process)

But I've now started observing a very interesting benefit of having the PRP as part of a pull request. 
Previously, a pull request contained only the code diff, which was the final result of what developers deemed ready to be published. 
We rarely got insight into the developer's thought process when implementing a feature. 
What constraints did they consider? Which edge cases did they think about? Did they write code or tests first?

Now a developer goes through an intense round of discussion with Gemini during the planning process. 
The PRP is a detailed documentation of that discussion. This means you not only get to see the final result (the code diff), 
but you also get to see the developer's intent and thought process. Developers could of course document their thought process
before AI, but how many would actually bother to do that? The AI agent automatically does this for you.

It's still early days, but I see great value in capturing this in a code repo. Having worked on several legacy projects, 
you're often at the mercy of code comments, commit messages, and linked tickets to understand why code was written. 
But developers might not have deemed it necessary to write a code comment, commit messages might be shallow or redundant, and linked tickets could be similarly devoid of useful information, or the company might have migrated to a new ticketing system entirely!

## [Conclusion](#conclusion)

Any kind of responsible coding requires extensive pre-planning. PRPs are just the AI version of the traditional PRD/RFC-driven processes. 
But PRPs do capture something traditionally lost in code reviews: the developer's thought process.

The AI landscape changes very quickly. It would be interesting to see how agentic coding practices like PRPs evolve.