---
title: "Understanding a Postgres query plan"
date: 2020-04-13T00:00:00+05:30
draft: false
author: "Sojjwal Kelkar"
tags:
- Database
readingTime: 15
---
A query plan is a sequence of steps used by a database to access data. Being able to read a query plan is key to understanding the performance of an SQL query. While tuning a query we need to know how the rows are being fetched from the tables? Are the indexes being used? What is the cost of joining to tables? A query plan provides with an answer for all of these questions.

In postgres we get the query plan by prepending a query with `EXPLAIN`. Example:
{{< highlight sql >}}
explain select count(*) from orders where created_at > '2020-01-01';

                                    QUERY PLAN
-----------------------------------------------------------------------------------
 Aggregate  (cost=6105004.83..6105004.84 rows=1 width=8)
   ->  Seq Scan on orders  (cost=0.00..6092726.20 rows=4911451 width=0)
         Filter: (created_at > '2020-01-01 00:00:00'::timestamp without time zone)
(3 rows)
{{< /highlight >}}

A database can employ various algorithms to fetch rows and join tables. So a query plan can be dense with jargon. Let's go through some of the common terms that appear in a query plan and understand why the planner favors some particular fetching mechanism over others. 

But first, we need to understand the structure of a query plan. From the [official documentation](https://www.postgresql.org/docs/12/using-explain.html):

{{<blockquote>}}
The structure of a query plan is a tree of plan nodes. Nodes at the bottom level of the tree are scan nodes: they return raw rows from a table. There are different types of scan nodes for different table access methods: sequential scans, index scans, and bitmap index scans. [...] If the query requires joining, aggregation, sorting, or other operations on the raw rows, then there will be additional nodes above the scan nodes to perform these operations. Again, there is usually more than one possible way to do these operations, so different node types can appear here too. The output of EXPLAIN has one line for each node in the plan tree, showing the basic node type plus the cost estimates that the planner made for the execution of that plan node. [...] The very first line (the summary line for the topmost node) has the estimated total execution cost for the plan; it is this number that the planner seeks to minimize.
{{</blockquote>}}

Let's break this down in simple terms. A query plan is structured as a tree. Each branch of this tree is called a 'plan node'. In the query plan, each of these nodes begin with an `->` arrow. The nodes at the lowest level correspond to how rows are fetched from a table. Each node on a higher level performs some operation on its child nodes. For example, if we have a query as following: `select count(*) from students where age > 10 and mentor_id = 1`. One of the possible ways this query can be processed is to fetch a set of all students whose age is greater than 10. Fetch another set of students whose mentor_id is 1. Then an AND operation is performed on both sets to get the final result. In this case, the query plan will have two bottom level nodes and with a parent node for the AND operation. There can be higher level nodes for any type of operations, like SORT, LIMIT, JOIN etc. that can be performed on raw rows.

Now let's go through each aspect of a query plan in more detail. 

## Fetching raw rows
A database can fetch rows from a table in different ways. This depends on factors such as whether appropriate indexes exist, the volume of rows to be fetched, the size of the table in question etc.

#### Sequential scan
{{< highlight sql >}}
explain select count(*) from users where created_at < '2020-01-01';
                                    QUERY PLAN
-----------------------------------------------------------------------------------
 Aggregate  (cost=3363.19..3363.20 rows=1 width=8)
   ->  Seq Scan on users  (cost=0.00..3350.90 rows=4916 width=0)
         Filter: (created_at < '2020-01-01 00:00:00'::timestamp without time zone)
(3 rows)
{{< /highlight >}}
In a sequential (or full) table scan, all table rows are loaded into the memory. If the query has any filtering criteria, they will be applied in-memory on the appropriate columns. The rows that satisfy the filtering condition are transmitted further. This method is used when indexes are not present on columns present in the query predicate (where clause). In the above example, all user rows are fetched and the rows that fail on the created_at condition are discarded. 

Even though a sequential scan may seem like a slow way of fetching data, a query planner may employ this approach even when an index is present on the filtering column. This may happen if:
* A table has very few rows. An index scan requires random seeks. If the whole table can fit whithin a few pages, it is just cheaper to load all those pages into memory, thus avoiding the overhead of random seeks.
* A query would return a large percentage of table rows. If suppose you've a query that would return 90% of all rows in a large table. In such a case, each page contains several rows that satisfy the query predicate. Again, fetching the whole page at once trumps over performing random seek that would access the same page several times.

Databases maintain query statistics to determine when to use sequential scan over index scan.

#### Index scan
{{< highlight sql >}}
explain select count(*) from users where created_at > '2020-01-01';
                                    QUERY PLAN
-----------------------------------------------------------------------------------
 Aggregate  (cost=319490.21..319490.22 rows=1 width=8)
   ->  Index Only Scan using index_users_created_at on users  (cost=0.56..317433.32 rows=822758 width=0)
         Index Cond: (created_at > '2020-04-01 00:00:00'::timestamp without time zone)
(3 rows)
{{< /highlight >}}

For an index scan to work an index must be present on the column used in the query predicate. The database uses that index to get the reference of all the tuples (rows) that satisfy the query predicate. Then the corresponding data page is accessed in the heap to fetch the rest of the required data from each tuple.

Suppose that a query has multiple predicates and all the columns in those predicates have indexes on them. The planner would typically not perform index scans for all the predicates. It would use index scan only on one of those columns and perform in-memory filtering for the remaining predicates.

An index scan is used for queries that have an ORDER BY condition that matches the index order. This saves an extra sorting step.

#### Bitmap scan
{{< highlight sql >}}
explain select * FROM users WHERE created_at < '2020-04-01';

                                  QUERY PLAN
------------------------------------------------------------------------------
 Bitmap Heap Scan on users  (cost=10.00..20.20 rows=50 width=8)
   Recheck Cond: (created_at < '2020-04-01')
   ->  Bitmap Index Scan on users_created_at  (cost=0.00..09.00 rows=50 width=0)
         Index Cond: (created_at < '2020-04-01')
{{< /highlight >}}

A plain index scan fetches one tuple-pointer at a time from the index and immediately visits that tuple in the table. This may mean a single page is visited multiple times if several tuples are located in it. A more optimal use of I/O operations would be to visit a page only once and fetch all desired tuples from it. A bitmap scan does just that.

A bitmap index scan fetches all the tuple-pointers from the index at once and sorts them using a bitmap data structure. A bitmap heap scan visits each heap page only only once to fetch all desired tuples from it. 

This method of row scanning has an overhead of maintaining the in-memory bitmap. If the bitmap gets too large, then we maintain only the references of the heap pages that contain matching tuples instead of keeping track of individual tuples within those pages. The whole page is loaded and the tuples are filtered on Recheck Condition to get the desired data. 

## Joining tables
#### Nested Loop join


## Cost estimation  
Each node is accompanied by a cost estimation that takes the form `(cost=10.00..20.00 rows=1 width=8)`. The costs are measured in an arbitrary unit determined by the planner's cost parameters. One of the ways the cost can be measured is in the unit of disk page fetches. The cost of an upper level node includes the cost of all its child nodes. Brief description of each field in the cost estimation:
* cost: This is a range of the estimated start-up cost and the estimated total cost. The start-up cost is the time spent before the tranmission of output rows begin. This may include the time required for sorting. The total cost is the time estimation for transmitting all eligible rows assuming the query would run to completion. Meaning, there may be a LIMIT clause in an outer query that would limit the number of transmitted rows. But the estimates don't consider these scenarios.
* rows: Estimated number of rows emitted by a plan node
* width: Estimated average width of rows emitted by a plan node in bytes.

`EXPLAIN` by itself just provides the query plan with cost estimation. If we execute a query with `EXPLAIN ANALYZE`, the query is actually executed. In each plan node, the true row count and the true run time is displayed along with the estimates. So that we can check the accuracy of the planner's estimation.
 {{< highlight sql >}}
explain analyze select count(*) from users where created_at > '2020-04-01';
                                                   QUERY PLAN
-----------------------------------------------------------------------------------------------------------------
 Aggregate  (cost=3356.22..3356.23 rows=1 width=8) (actual time=7.357..7.358 rows=1 loops=1)
   ->  Seq Scan on users  (cost=0.00..3350.90 rows=2126 width=0) (actual time=0.007..7.241 rows=2132 loops=1)
         Filter: (created_at > '2020-04-01 00:00:00'::timestamp without time zone)
         Rows Removed by Filter: 37060
 Planning Time: 0.159 ms
 Execution Time: 7.379 ms
(6 rows)
{{< /highlight >}}

