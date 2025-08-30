---
title: "Squashing ruby on rails database migrations"
date: 2021-02-13T00:00:00+01:00
draft: false
author: "Sojjwal Kelkar"
tags:
- Ruby on Rails
---

## Why?

There are several reasons why you'd want to squash the database migrations in your Ruby on Rails application:

1. In a long running project you may end up with hundreds of files in your `db/migrate` folder over time. Carrying these legacy
   migrations incurs maintenance overhead. For example, when upgrading the Rails version, you may need to modify those old migrations for
   syntax changes.

2. If your build process involves recreating the database to run the tests, it would need to run all of these old migrations. Running a lot
   of migrations would slow down the build time.

3. The migration file names need to be in the format `YYYYMMDDHHMMSS_add_quantity_to_orders.rb`. The timestamp is used to determine
   the order in which the migrations are applied. Rails provides a generator
   to create such migration files automatically. But sometimes developers may create these files manually. If they make a mistake
   in the timestamp and commit the migration, it would mess up the ordering. For example, someone may accidentally add an extra digit in the timestamp and the migration
   may get applied on production. Then all subsequent migrations
   should also contain the extra digit to maintain the order of the migrations. In such a case it is better to squash the migrations and start over.

4. The previous point also applies to any problems due to not following the best practices while creating migrations (eg. incorrectly using
   a model class in the migration). In all of such cases, we can squash the migrations and get a clean slate.

## What?

The purpose of migrations is to incrementally evolve an existing database. When setting up a new environment, they can create
a new database with the desired schema and settings suitable for our application.

The squashed migration is just a regular migration that replaces the existing migrations and becomes the starting point
going forward. Just like any other
migration, it is a subclass of `ActiveRecord::Migration` and follows the same naming convention.

There are two important things to consider when creating the squashed migration:

1. On running the squashed migration in a new database, it should end up with the table structure and settings identical to other
   existing databases.

2. You would need to run the squashed migration on the existing databases as well. Doing this on an existing
   database should have absolutely no effect. For example, the squashed migration should not accidentally recreate a production table.

## How?

Rails maintains a schema file (located in `db/schema.rb`) that represents the current state of the database. Every time a migration runs,
this file gets automatically updated to incorporate the changes introduced by that migration.

1. When creating the squashed migration, the first step could be to copy the contents of the schema file into its `up` or `change` method.

2. Remember, this migration should not change anything if applied on an existing database. Therefore from each `create_table` statement,
   remove the `force` flag and add a `table_exists?` check to ensure that it won't try to recreate a table if it already exists.

3. This also applies to any other database objects like enums, the table definitions may depend on. If Rails does not provide an 'exists?' method
   for these objects, you may need to run plain SQL queries like this:
```
ActiveRecord::Base.connection.execute("select 1 from pg_type where typname = '#{enum_type_name}'").first.present?
```      

4. Similarly add checks on all `add_foreign_key` statements to ensure they are only created if they don't exist. Rails provides a
   `foreign_key_exists?` method that can be used here.

5. While the schema file contains most of the information about the database schema, it does not capture everything. It does not support
   several features that may be provided by the database such as triggers, sequences, stored procedures etc. If the database is Postgres,
   schema file does not capture table level settings such as autovacuum_vacuum_scale_factor. It also lacks any information about
   table partitioning.

Due to this limitation, it is strongly recommended that you must scan through all of the old migration files to look for these features or settings.
You'd need to explicitly add them in your squashed migration.