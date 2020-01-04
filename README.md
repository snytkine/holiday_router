# Holiday Router
##Advanced URI Routing library for matching URI to controller
####Written in Typescript. Strong typing and interface based design makes it very flexible for developers to implement own controller classes.
####Over 150 unit tests covering 100% of codebased and lots of extra real-life cases.
####Using industry standard eslint rules for typescript makes use of best practices for writing clean tyescript code
###Features
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
