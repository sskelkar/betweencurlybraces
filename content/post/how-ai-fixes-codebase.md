---
title: "How AI is forcing us to finally fix our codebase"
date: 2026-04-25T00:00:00+05:30
draft: false
author: "Sojjwal Kelkar"
tags:
- Agentic Coding
---

It is Q2 of 2026 and agentic coding is so thoroughly ingrained in our daily development process that life without it has started to become unimaginable. Don’t we all sometimes wonder: How did people travel to another country before translation or navigation apps? How did people survive without emails and smartphones? Pretty soon it’s going to be: how did people write code before AI agents?

If like my team, you are using agentic coding responsibly in a serious production project, you might have noticed another change - the code repo has markedly improved.

Wait, what? Aren’t there like ten posts every day on Reddit bemoaning about how vibe coding has left unmanageable mess? That every project jumping on the AI bandwagon is in for a reckoning six months from now?

Well, perhaps.

But AI's reputation of hallucinating and making expensive mistakes has ironically helped our codebase get better. Developers are being extra careful to prevent any ambiguities.

Some observations from my team:

- Detailed documentation is being created explaining all the context that’s not captured in raw code, because the AI agent needs to read it.
- Well-structured code and good variable names are being prioritized, because AI needs to understand it.
- Unit test coverage is being improved so that AI doesn't accidentally break something
- Error messages are being improved, because the LLM needs to interpret them.
- Dead code is being deleted to avoid confusing the AI. Because we know if something is deprecated, AI doesn't.
- Explicit coding conventions and style guides are being written, because AI should follow established patterns. There are no unwritten rules anymore. Otherwise how is AI supposed to know them?
- No more knowledge hoarding! Every team has that one engineer who possesses arcane knowledge about the project or the architecture, simply by virtue of being on the team for 5 years. But if you want the AI agent to help, you’ve got to document what you know.

## The Double Standard

All this due diligence I mentioned above could have been done all along, so that it would be easier for any new joiner to get onboarded. But it’s interesting to see developers being so conscientious when it comes to AI.

There’s another aspect to this. When a new developer joins the team, it’s expected that they will take some time to get used to our way of working. People are accommodating to newbie mistakes.

But there is very little patience for AI making the same mistakes that a human can make. Despite AI agents being as impressive as they are, any error committed by them leads to profound disappointment. So we are now doing for AI what we should have been doing for humans all along.

## False premise hallucinations

In logic, a conclusion can be logically valid, but incorrect, if it is drawn from an incorrect premise.

Let's look at some common bug patterns:
- mixing up two similar looking fields that can have very different business meanings
- a behaviour change that has no impact within the context of a service, but it breaks something for a downstream dependency
- changing the ordering of operations without knowing that they have temporal coupling
- introducing performance problems when the constraints of the infrastructure are not known

When AI makes such mistakes, we call them hallucinations. But without documentation, AI is simply operating on incomplete information. A human developer without the full context, would make similar mistakes. This is why I believe that [AI mistakes are not very different from what humans can make](https://sskelkar.github.io/post/ics-using-genai-should-think-like-managers/#ai-mistakes-are-human-like), under certain circumstances.

Capturing this knowledge in project documentation prevents the problem of AI working with false premise.


## RTFM

It's worth acknowledging that the problem of inadequate documentation is not ubiquitous. Many teams were always diligent about maintaining good documentation with utmost discipline. Certain kind of projects, like open source or any project that required open collaboration, by design required proper documentation, so that anyone can easily contribute to them.

But reality is that most projects being developed by close-knit teams are not like that. Even if some documentation exists, it tends to quickly become outdated. It's hard work to manually keep all of your documentation updated.

In such teams, the knowledge was passed down from engineer to engineer as an oral tradition like the societies of the antiquity. But now in the age of agentic coding, they must evolve to rely on the written word, so that they can ask the AI agent to [RTFM](http://rtfm.urbanup.com/815539).

It has never been easier to generate quality documentation. Hooks or workflows can be built to update the documentation as part of the development process.



## Closing thoughts

This renewed emphasis on code readability and documentation doesn’t just help AI work more safely, it makes the entire development process, human or agentic, more systematic and maintainable. It spares the developer from the burden of prompting all the relevant information every time.

It is also a step towards increased agentic autonomy. If AI has the full context of a project, it's going to make fewer errors. It is an important prerequisite if you want to unleash vibe coding on a serious production project in a responsible way.