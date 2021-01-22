---
title: "Understanding a Postgres query plan"
date: 2020-04-13T00:00:00+05:30
tags:
- Database
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


> The structure of a query plan is a tree of plan nodes. Nodes at the bottom level of the tree are scan nodes: they return raw rows from a table. There are different types of scan nodes for different table access methods: sequential scans, index scans, and bitmap index scans. [...] If the query requires joining, aggregation, sorting, or other operations on the raw rows, then there will be additional nodes above the scan nodes to perform these operations. Again, there is usually more than one possible way to do these operations, so different node types can appear here too. The output of EXPLAIN has one line for each node in the plan tree, showing the basic node type plus the cost estimates that the planner made for the execution of that plan node. [...] The very first line (the summary line for the topmost node) has the estimated total execution cost for the plan; it is this number that the planner seeks to minimize.


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
* A table has very few rows. An index scan requires random seeks. If the whole table can fit within a few pages, it is just cheaper to load all those pages into memory, thus avoiding the overhead of random seeks.
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
#### Nested loop join
{{< highlight sql >}}
explain select p.name, t.name from players p join teams t on (t.id = p.team_id);
                                   QUERY PLAN
------------------------------------------------------------------------------
 Nested Loop  (cost=0.56..2761623.95 rows=36867792 width=14)
   ->  Seq Scan on teams t  (cost=0.00..5528.03 rows=44303 width=14)
   ->  Materialize  (cost=0.29..8.51 rows=10 width=244)
     ->  Index Only Scan using index_players_on_team_id on players p  (cost=0.56..47.13 rows=1508 width=4)
           Index Cond: (team_id = t.id)
{{< /highlight >}}

This method of joining two tables is preferred when one side of the join has few rows. In the above query plan all the tables are fetched via sequential scan. Then for each team id, an index scan is performed on the players table to fetch the corresponding rows. 

In a nested loop join is performed on two nodes. A node can be a table or an intermediary step in a query plan. The second node of the join is looped over for each row in the first node. This method works better when the second node (the one that is being looped over) can be index scanned. The join column value from each row of the first node (team id in the above example) serves as the key for the index scan of the second node.

In the above query plan, there's a 'Materialize' node above the index scan on players table. Because in a nested loop join the second relation is accessed several times, the Materialize node saves its data in memory after the first pass. The same in-memory data is used in each subsequent pass.

Nested loop join is the only method of joining tables if the join condition does not use the equality operator.

#### Hash join
{{< highlight sql >}}
explain select p.name, t.name from players p join teams t on (t.id = p.team_id);
                                   QUERY PLAN
------------------------------------------------------------------------------
 Hash Join  (cost=6082.38..1557549.17 rows=36867792 width=14)
   Hash Cond: (p.team_id = t.id)
   ->  Index Only Scan using index_players_on_team_id on players p  (cost=0.56..1454680.32 rows=36867792 width=4)
   ->  Hash  (cost=5528.03..5528.03 rows=44303 width=14)
         ->  Seq Scan on teams t  (cost=0.00..5528.03 rows=44303 width=14)
{{< /highlight >}}

In a hash join, the relation on the right side of the join is scanned and loaded into an in-memory hash table using its join attribute as the hash key. Then the left relation is scanned and the join attribute is used to look up matching row of the second relation in the hash table.

This join method can be used when the join condition uses the equality operator, both sides of the join are large and the hash can fit in the memory.

#### Merge join
{{< highlight sql >}}
explain select p.name, t.name from players p join teams t on (t.id = p.team_id);
                                   QUERY PLAN
------------------------------------------------------------------------------
 Merge Join  (cost=198.11..268.19 rows=10 width=488)
   Merge Cond: (p.team_id = t.id)
   ->  Index Scan using index_players_on_team_id on players p  (cost=0.29..656.28 rows=101 width=244)
   ->  Sort  (cost=197.83..200.33 rows=1000 width=244)
         Sort Key: t.id
         ->  Seq Scan on teams t  (cost=0.00..148.00 rows=1000 width=244)
{{< /highlight >}}

In this join method, both relations are first sorted on the join attribute. Then the two relations are scanned in parallel to find the matching rows. This method can be used when the join condition uses the equality operator, both sides of the join are large but can be efficiently sorted on the join attribute. 

In the above example, players is sorted using the index on team_id column. The team table could also be sorted on its primary key. But in this instance, the query planner preferred a sequential scan and sort. A sequential scan and sort is preferable than an index sort when the table is large and cost of the nonsequential disk access required by the index scan is higher than a simple full scan and sorting.

## Cost estimation  
Each node is accompanied by a cost estimation that takes the form `(cost=10.00..20.00 rows=1 width=8)`. The costs are measured in an arbitrary unit determined by the planner's cost parameters. One of the ways the cost can be measured is in the unit of disk page fetches. The cost of an upper level node includes the cost of all its child nodes. Brief description of each field in the cost estimation:
* cost: This is a range of the estimated start-up cost and the estimated total cost. The start-up cost is the time spent before the tranmission of output rows begin. This may include the time required for sorting. The total cost is the time estimation for transmitting all eligible rows assuming the query would run to completion. Meaning, there may be a LIMIT clause in an outer query that would limit the number of transmitted rows. But the estimates don't consider these scenarios.
* rows: Estimated number of rows emitted by a plan node
* width: Estimated average width of rows emitted by a plan node in bytes.

## EXPLAIN ANALYZE
`EXPLAIN` by itself just provides the query plan with cost estimation. If we execute a query with `EXPLAIN ANALYZE`, the query is actually executed. In each plan node, the true row count and the true run time is displayed along with the estimates. So that we can check the accuracy of the planner's estimation.
 {{< highlight sql >}}
explain analyze select count(*) from users where created_at > '2020-04-01';
                                  QUERY PLAN
------------------------------------------------------------------------------
 Aggregate  (cost=3356.22..3356.23 rows=1 width=8) (actual time=7.357..7.358 rows=1 loops=1)
   ->  Seq Scan on users  (cost=0.00..3350.90 rows=2126 width=0) (actual time=0.007..7.241 rows=2132 loops=1)
         Filter: (created_at > '2020-04-01 00:00:00'::timestamp without time zone)
         Rows Removed by Filter: 37060
 Planning Time: 0.159 ms
 Execution Time: 7.379 ms
(6 rows)
{{< /highlight >}}

Depending on the query plan, EXPLAIN ANALYZE provides much richer information than just actual costs. This includes:
* The number of actual loops performed in a nested loop join
* If sorting was involved, then the algorithm and the amount of memory used for sorting
* If hash joins were involved, the number of hash buckets and the peak memory used for hash tables
* Rows rejected by a filter condition or an index recheck
