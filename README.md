[![Build Status](https://travis-ci.com/snytkine/holiday_router.svg?branch=master)](https://travis-ci.com/snytkine/holiday_router)
[![codecov](https://codecov.io/gh/snytkine/holiday_router/branch/master/graph/badge.svg)](https://codecov.io/gh/snytkine/holiday_router)
[![Known Vulnerabilities](https://snyk.io/test/github/snytkine/holiday_router/badge.svg?targetFile=package.json)](https://snyk.io/test/github/snytkine/holiday_router?targetFile=package.json)
[![Maintainability](https://api.codeclimate.com/v1/badges/75c7ae20ca921d0db458/maintainability)](https://codeclimate.com/github/snytkine/holiday_router/maintainability)

# Holiday Router
## Advanced URI Routing library for matching URI to controller
## Open Source under the *MIT License*
#### Written in Typescript. Strong typing and interface based design makes it very flexible for developers to implement own controller classes.
#### Over 150 unit tests covering 100% of codebased and lots of extra real-life cases.
#### Using industry standard eslint rules for typescript makes use of best practices for writing clean tyescript code
### Features
* Named uri parameters /catalog/{category}/{subcategory/
* Catchall routes with support for named catchall parameter /images/\*\*imagepath
or just /images/\*\* for anonymous catchall param
* Support for prefix and postfix in uri segments /catalog/category-{category}.html
In this example the category- is a prefix and .html and postfix and category will be extrafted from url
* Support for regex matches in uri segments /cagegory/{categoryid:[0-9]+}}/info
In this case the named parameter categoryid must be all numeric or it will not produce a match
* Regex segments in match are also extracted and added to RouteMatch (return object from uri match)
* Named routes for reverse route generation. 
* Multiple routes per uri match. This way a developer may have their own custom logic in addition
to just matching the url. For example there could be a requirement to pick different controller
for the same URI based on value of the request header, or presense of query parameters, or time of day,
or anything else. When route is matched it always returns array of objects that implemnt IControllr interface
If this feature is not required then just add a single object per URI ane a match will return array with one element
Also there is a convenience classes for creating instances of IController.
* Compact tree structure for storing routes makes it very memory-efficient and fast.
* Convenience class HttpRouter is a wrapper class than added support for adding routes specific to http request methods. Basically HttpRouter holds a Map<httpMethod, Router> and matches the http method first and if found delegates uri resolution to a router object for that method.

## Installation

Install using [npm](https://www.npmjs.org/):

```sh
npm install holiday-router
```

## API Reference
* ####[Interfaces](#Holiday-Router--Interfaces)
    * [IController](#Interfaces--IController)
    * [IRouteMatch](#Interfaces--IRouteMatch)
    * [IRouteMatchResult](#Interfaces--IRouteMatchResult)
    * [IUriParams](#Interfaces--IUriParams)
    * [IRegexParams](#Interfaces--IRegexParams)
    * [IStringMap](#Interfaces--IStringMap)
    * [IRouteInfo](#Interfaces--IRouteInfo)
    * [Note\<T>](#Interfaces--Node\<T>)

* ####Errors
    * [RouterError](#Errors--RouterError)

*   ####Enums
    * [RouterErrorCode](#Enums--RouterErrorCode)

*   #### Classes
    * [Router](#Router--class)
        * [new Router\<T extends IController>()](#Router_new)
        * _instance methods_
            * [.addRoute(uri: string, controller: T)](#Router--addRoute) : <code>Node\<T></code>
            * [.getRouteMatch(uri: string)](#Router--getRouteMatch): <code>IRouteMatchResult\<T extends IController></code>
            * [.makeUri(controllerId: string, params: IStringMap = {})](#Router--makeUri): <code>string</code>
            * [.getAllRoutes()](#Router--getAllRoutes): <code>Array\<IRouteInfo></code>
    * [HttpRouter](#HttpRouter-class) 
        * [new HttpRouter\<T extends IController>()](#HttpRouter_new)  
        * _instance methods_
            * [.addRoute(httpMethod: string, uri: string, controller: T)](#Router--addRoute) : <code>Node\<T></code>
            * [.getRouteMatch(httpMethod: string, uri: string)](#Router--getRouteMatch): <code>undefined | IRouteMatch\<T></code>
            * [.makeUri(httpMethod: string, controllerId: string, params?: IStringMap)](#Router--makeUri): <code>string</code>
            * [.getAllRoutes()](#Router--getAllRoutes): <code>Array\<IHttpRouteInfo></code> 

<a name="Holiday-Router--Interfaces"></a>

##Interfaces
<a name="Interfaces--IController"></a>
#### IController
Developer must implement own class that implements an IController interface
or use one of 2 helper Classes: BasicController or UniqueController
```typescript
interface IController {
  /**
   * Controller must implement its own logic
   * of how it determines if another controller is functionally equal
   * to this controller.
   *
   * The purpose of calling equals(other) method is to prevent
   * having 2 controller that can respond to same uri.
   *
   * @param other
   */
  equals(other: IController): boolean;

  /**
   * Multiple controller may exist in the same node, meaning
   * that more than one controller can match same uri
   * it's up to consuming program to iterate over results and
   * find the best match.
   * a controller with higher priority will be returned first from
   * controller iterator.
   * In general if multiple controllers can be used for same URI, a controller
   * will also have some sort of filter function that will accept one or more params
   * from consuming application to determine if controller is a match
   * a controller with a more specific filter should have higher priority
   *
   * For example one controller may require that request have a specific header
   * and another controller will serve every other request. The controller that requires
   * a specific header should be tested first, otherwise the second more general controller
   * will always match. For this reason the first controller must have higher priority
   */
  priority: number;

  /**
   * Identifier for a controller. It does not have to be unique
   * it is used primarily for logging and debugging, a way to add a name to controller.
   */
  id: string;

  /**
   * Used for logging and debugging
   */
  toString(): string;
}
```

<a name="Interfaces--IRouteMatch"></a>
#### IRouteMatch
```typescript
interface IRouteMatch<T extends IController> {
  params: IUriParams;
  node: Node<T>;
}
```

---
<a name="Holiday-Router--classes"></a>
##Classes
### Router
<a name="Router_new"></a>

#### new Router([opts])
Creates a new instance of Router.

**Example**
```javascript
import { Router } from 'holiday-router';

const router = new Router();
```
---
<a name="Router--addRoute"></a>
#### .addRoute(uri: string, controller: T): <code>Node\<T></code>
Adds route to router. 

| param | type | description | 
| --- | --- | --- |
| uri | <code>string</code> | uri with supported uri template syntax |
| controller | <code>IController</code> | Controller is an object that must implement IController interface |

**Example**
In this example we adding uri template
that will match any uri that looks like 
/catalog/category/somecategory/widget-34/info

```javascript
import { Router, BasicController } from 'holiday-router'; 

const router = new Router();
router.addRoute('/catalog/category/{categoryID}/widget-{widget:[0-9]+}/info', new BasicController('somecontroller', 'ctrl1'));
```

Notice that 
 - First 2 uri segments must be matched exactly but third and fourth
uri segments are placeholder segments.
 - Third segment can match any string and that string will then be
available in the RouteMatch object when .getRouteMatch() is called with the uri
 - Fourth segment has a prefix widget- and the placeholder is a Regular Expression based param
it must match the regex \[0-9]+ (must be numeric value)

---
