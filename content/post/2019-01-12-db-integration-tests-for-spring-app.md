---
title: "Database integration tests for a Spring application"
date: 2019-01-12T00:00:00+05:30
draft: false
author: "Sojjwal Kelkar"
tags:
- Java
- Spring
- Unit Testing
readingTime: 18
---
Suppose you are tasked with writing tests for a Spring and Hibernate application. This application uses a mix of native queries, HQL or entity associations to fetch data from the database. If you choose to mock the DAO or entity layers, you leave a significant portion of the code untested. In such cases data integration tests can provide the most correct feedback. But you do you configure your application to run integration tests?

To demonstrate this, I have created a simple Spring MVC and Hibernate application that connects with MySQL database. The code is available in the [spring-database-test](https://github.com/sskelkar/spring-database-test) repo on Github. This application has a simple use case. We have two types of entities – `Department` and `Employee`. In `DepartmentService`, we have a single method that interacts with the DAO layer to fetch all the employees belonging to a department. This application uses both XML and annotation based configuration. The Spring and Hibernate config files are present in the resources folder.

In this post, I’ll show two ways of writing database integration tests for this app.

### 1. Using Dockerized MySQL instance

While a production app points to a fixed database, it is not feasible to have the same for running tests. We’d like to start up a temporary instance of a database, set it up with our production schema, run the tests against it and shut it down in the end. With the advancements in container technology, it is now very convenient to start a MySQL instance inside a docker container. The application can be pointed to it while running tests. After all the tests are run, the container can be shutdown.

I’ll use the [`Testcontainers`](https://www.testcontainers.org/) library to provide a temporary MySQL database container to the integration tests. This library provides an API to instantiate a docker container with MySQL server running in it. We can use an SQL script to set up the schema in the database, and specify it as an `init script`.

If you have already cloned the [`spring-database-test`](https://github.com/sskelkar/spring-database-test) repo, you need to checkout the mysql branch to access the code for this dockerized MySQL demo.

While running tests, we need to change the datasource config of our spring app, so that it points to the MySQL docker container. We will use annotation based Spring configuration as shown in the `TestConfiguration` class. `Testcontainers` library supports several types of databases. For MySQL, we will use the `MySQLContainer` class. We can specify the MySQL version while instantiating the `MySQLContainer` object and provide the location of an init script before starting the docker container. In this init script I will create the department and employee tables.

{{<highlight java>}}
@Bean
public DataSource dataSource() {
  MySQLContainer mysql = new MySQLContainer("mysql:5.6.42");
  mysql.withInitScript("database.sql").start();
  HikariConfig hikariConfig = new HikariConfig();
  hikariConfig.setDriverClassName(mysql.getDriverClassName());
  hikariConfig.setJdbcUrl(mysql.getJdbcUrl());
  hikariConfig.setUsername(mysql.getUsername());
  hikariConfig.setPassword(mysql.getPassword());

  return new HikariDataSource(hikariConfig);
}
{{</highlight>}}

From `MySQLContainer`, we can get the database url and credentials that we can pass into HikariConfig to create the datasource. Using the datasource bean, we can initialise the SessionFactory bean.

The test class is extended from `AbstractTransactionalJUnit4SpringContextTests` that does two things. It provides a `JdbcTemplate` object that can be used to execute database commands or query from the unit test. And it makes each unit test transactional.

Finally let’s take a look at a simple unit test.

{{<highlight java>}}
@Test
public void shouldReturnEmployeesInAGivenDepartment() {
  //given
  jdbcTemplate.execute("insert into department values(30, 'admin')");
  jdbcTemplate.execute("insert into department values(40, 'support')");
  jdbcTemplate.execute("insert into employee values(1, 'john', 30)");
  jdbcTemplate.execute("insert into employee values(2, 'paul', 30)");
  jdbcTemplate.execute("insert into employee values(3, 'george', 40)");

  //when
  List employees = departmentService.getEmployeesInDepartment("admin");

  //then
  assertEquals(2, employees.size());
  assertEquals(asList(1, 2), employees.stream().map(Employee::getId).collect(toList()));
}
{{</highlight>}}

The `JdbcTemplate` is used to set up some data. `DepartmentService` bean is autowired in the unit test and it interacts with real data. After all the tests are run, `MySQLContainer` will shutdown the docker container automatically.

An advantage of this approach is that we can use and test actual MySQL constructs in our unit tests that may be missing in an in-memory database. Secondly, if we have database migrations in our project while setting up a new environment, we can run the same migrations on the test database and simulate the production environment as closely as possible. But an obvious disadvantage is the increase in time taken to run the tests. Starting up the docker container itself can increase the testing time by 10-15 seconds.

### 2. Using H2 in-memory database

We can reduce the testing time by using an in-memory database. In this part of the demo I’ll reimplement the above unit test using H2 database instead of MySQL. But beware that this approach won’t work if you’re using any MySQL specific constructs in your code that aren’t available in H2. The code for this is in the h2 branch of spring-database-test repo.

The datasource is created as following:

{{<highlight java>}}
@Bean
public DataSource dataSource() {
  HikariConfig hikariConfig = new HikariConfig();
  hikariConfig.setDriverClassName("org.h2.Driver");
  hikariConfig.setJdbcUrl("jdbc:h2:mem:example");
  hikariConfig.setUsername("test");
  hikariConfig.setPassword("test");

  return new HikariDataSource(hikariConfig);
}
{{</highlight>}}

In hibernate properties, we use `H2Dialect` now. One important change is the addition of a new property `hibernate.hbm2ddl.auto`, which is set to create. This will automatically create the schema based on your model structure. If this feels too lax, we can create the schema using a script just like we did in the previous example.

You will notice that the unit test in this case is exactly identical to what we wrote in the previous demo. This means that the tests are database agnostic. This gives us the flexibility of using either of the above approach while running the tests.

### 3. Toggle between H2 and MySQL
We can create the datasource bean using either h2 or MySQL container depending on a system property. During development, we can use h2 because it has a shorter running time. Quicker feedback is desirable during TDD or general coding. On the other hand, we’d want to be thorough before the actual deployment. So MySQL can be used while building the project in the CI/CD pipeline.

Firstly, in order to pass in system properties in our project during test or build tasks, we need to add the following in `build.gradle`:

```javascript
test {
    systemProperties System.properties
}
```
In `TestConfiguration`, we check the value of the system property to decide how to create the datasource.

{{<highlight java>}}
private static class ForUsingMySQL implements Condition {
  @Override
  public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
    Environment env = context.getEnvironment();
    return "mysql".equals(env.getProperty("testDB"));
  }
}

private static class ForUsingH2 implements Condition {
  @Override
  public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
    Environment env = context.getEnvironment();
    return !"mysql".equals(env.getProperty("testDB"));
  }
}

@Bean
@Conditional(ForUsingH2.class)
public DatabaseProperties h2DatabaseProperties() {
  return new DatabaseProperties("org.h2.Driver", "jdbc:h2:mem:ia", "org.hibernate.dialect.H2Dialect", true);
}

@Bean
@Conditional(ForUsingMySQL.class)
public DatabaseProperties mysqlDatabaseProperties() {
  MySQLContainer mysql = new MySQLContainer("mysql:5.6.42");
  mysql.withInitScript("database.sql").start();
  return new DatabaseProperties(mysql.getDriverClassName(), mysql.getJdbcUrl(), "org.hibernate.dialect.MySQL5InnoDBDialect", false);
}

@Bean
public DataSource dataSource(DatabaseProperties databaseProperties) {
  HikariConfig hikariConfig = new HikariConfig();
  hikariConfig.setDriverClassName(databaseProperties.getDriverClass());
  hikariConfig.setJdbcUrl(databaseProperties.getJdbcUrl());
  hikariConfig.setUsername(databaseProperties.getUsername());
  hikariConfig.setPassword(databaseProperties.getPassword());

  return new HikariDataSource(hikariConfig);
}
{{</highlight>}}

If we build the project with command `gradle clean build -DtestDB=mysql`, The `@Conditional` of `mysqlDatabaseProperties()` kicks in, `MySQLContainer` is initialized and the datasource is created using MySQL properties. If we try running the build without `testDB` property, datasource will be created using H2 properties and tests will run against H2.


