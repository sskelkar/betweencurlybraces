---
title: "The small pleasures of programming"
date: 2018-09-23T00:00:00+05:30
tags:
- Coding is fun
---
It’s not just pulling off a complex engineering feat that makes programmers love their jobs. There are small pleasures to be had even in your day to day tasks, if you look for them.

Seasoned programmers know the thrill of recognising the possibility to introduce an abstraction over duplication. 
A task as simple as renaming a variable can be the difference between obscurantism and lucidity. 
It’s the boy scout principle in action. Making your code a bit more pleasant to revisit. 
The joy one derives in these simple improvements is akin to [Amelie](https://en.wikipedia.org/wiki/Am%C3%A9lie)’s _les petits plaisirs_.

![](https://thumbs.gfycat.com/AssuredGranularKestrel-small.gif)

Recently, while working on some code I came across following conditional statement:

{{<highlight java>}}
if (!order.isItReserved()) {
    if (!(isAdmin(user.getUserType()) && order.isItConfirmed())) {
        // throw error
    }
}
// do something
{{</highlight>}}
It took a while to wrap my head around this bit of convolution. 
After going through the unit tests and discussing with the QAs, I was able to summarise the required functionality as following:

> If order is reserved, or current user is admin and order is confirmed, then do some work, else throw error.
  
What followed was a small session of refactoring. Methods were renamed. A responsibility moved into a domain object. A classic adversary of readability – the “!” operator was eliminated. The result was:

{{<highlight java>}}
if (order.isReserved() || (user.isAdmin() && order.isConfirmed())) {
    // do something
} else {
	// throw error
}
{{</highlight>}}

What is so special about this? If you read the conditional statement slowly, it reads almost exactly like the functional spec that’s written above in English! Code readability is a fundamental tenet to judge code quality. Making your code as readable to a human as it is to the machine is the ultimate ideal.

Now functionally, the two code snippets work exactly the same and do what the client asked for. But the satisfaction one gets on making something elegant is an added bonus over making something merely utilitarian.