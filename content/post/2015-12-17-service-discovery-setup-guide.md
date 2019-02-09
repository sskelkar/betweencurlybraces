---
title: "Step by step guide to set up a service discovery environment"
date: 2015-12-17T00:00:00+05:30
draft: false
author: "Sojjwal Kelkar"
tags:
- Java
- Microservices
readingTime: 12
---
In a microservices environment we can run multiple instances of a service for resilience and scalability. 
In a cloud environment these instances can go up and down arbitrarily.
So we need some kind of service discovery mechanism to keep track of running instances. When a service A needs to call a service B,
it asks for the address of any running instance of service B from the service discovery. The service discovery can also load balance the
incoming requests. In this post I demonstrate how to setup a service discovery environment with [Netflix Eureka](https://github.com/Netflix/eureka).
When ever a service instance spins up, it registers itself with Eureka and sends regular heartbeats to confirm its availability. 

This is a step by step guide to set up a service discovery, to which we will register a demo server and *discover* it from a demo client service.

### Steps to configure a Eureka server
a. Create a new Gradle project for the Eureka server. In https://start.spring.io/, select the starters for `Eureka Server`.

b. In your project, navigate to `src/main/resources`. Rename the automatically generated `application.properties` file to `bootstrap.yml`.
c. Configure the `bootstrap.yml` as following:
{{< highlight python >}}
spring:
  application:
    name: demo-eureka-server
server:
  port: 8002
eureka:
  client:
    registerWithEureka: false
    fetchRegistry: false
    serviceUrl:
      defaultZone: http://localhost:${server.port}/eureka/
{{< /highlight >}}

Here we declared the application name, and port number for our eureka server as `8002`. Rest of the configuration tells this application to not to register itself with the available Eureka instance, which in this case is itself!

d. Annotate the application’s main class with `@EnableEurekaServer`.

e. Run the application. Your Eureka server is ready.

### Steps to configure a demo server that will register itself to Eureka
a. Create a new Gradle project for the demo server. In https://start.spring.io/, select the starters for web and Eureka Discovery.

b. In your project, navigate to `src/main/resources`. Rename the automatically generated `application.properties` file to `bootstrap.yml`.
c. Configure your `bootstrap.yml` like following:
{{< highlight python  >}}
spring:
  application:
    name: demo-server
server:
  port: 8080
eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8002/eureka/
{{< /highlight >}}

Spring Cloud based services have a `spring.application.name` property. It is used to pull down configuration from the Configuration server, to identify the service to Eureka, and can be referenced in numerous other contexts when building Spring Cloud based applications. This value typically lives in `src/main/resources/bootstrap.yml`, which is picked up earlier in the initialization than the normal `src/main/resources/application.yml`.

d. Annotate the application’s main class with `@EnableDiscoveryClient`.

e. Let's also quickly write a rest endpoint that we will call from the client service. Create a controller class with following content:
{{< highlight java  >}}
@RestController
public class DemoServerController {
    @RequestMapping(value="/greet",method=RequestMethod.GET)
    public String greet(@RequestParam String name) {
        return "Hello " + name;
    }
}
{{< /highlight >}}

f. Run the application. In the command prompt you will see the service registering itself to the Eureka server.

### Steps to configure a demo client
a. Create a new Gradle project for the demo client service. In https://start.spring.io/, select the starters for web, Feign and Eureka Discovery.

b. In your project, navigate to `src/main/resources`. Rename the automatically generated `application.properties` file to `bootstrap.yml` and configure it as following:
{{< highlight python >}}
spring:
  application:
    name: demo-client
    
server:
  port: 8111 
eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8002/eureka/

{{< /highlight >}}

c. Annotate the application’s main class with `@EnableDiscoveryClient` and `@EnableFeignClients`.

d. Our aim is to call `demo-server`’s API via our client service. So we need to create an interface that will acts as our REST client for talking to `demo-server`. Create an interface as following:
{{< highlight java  >}}
@FeignClient("demo-server")
public interface DemoServerClient {
    @RequestMapping( method=RequestMethod.GET, value="/greet")
    public String greet(@RequestParam("name") String name); 
}
{{< /highlight >}}

We have annotated the interface with `@FeignClient` that takes the name of the target service as it is registered at the Eureka server. The signature of greet method is identical to the way it is declared in `demo-server`’s public API.

e. Now to verify that everything is working fine, lets create a rest endpoint in our client service, which will delegate its call to `demo-server`’s `greet` method.
{{< highlight java  >}}
@RestController
public class DemoClientController {
    @Autowired
    DemoServerClient demoServerClient;
  
    @RequestMapping(value="/hello",method=RequestMethod.GET)
    public String hello(@RequestParam String name) {
        return demoServerClient.greet(name);
    }
}
{{< /highlight >}}

Note that Spring will automatically inject an implementation for `DemoServerClient` interface.

f. Hit http://localhost:8111/hello?name=World from your browser and it will print “Hello World”.

> Important: Before trying the API from client service, make sure that both `demo-server` and `demo-client` are registered at the Eureka server.

