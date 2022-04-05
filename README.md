# Yieldstreet Survey Challenge

The challenge is focus to test skills in web development with React framework. To see all requirements, follow the doc about [Challenge](./docs/challenge.pdf).

The choose of development to doesn't use JSX, was to improve more skills in react and of course to simple funny.

# Libraries

-   [React](https://reactjs.org/) Framework
-   [ReactDOM]() Library required by React
-   [MaterialUI](https://mui.com) LibUI to build pretty components.
-   [Font](https://fonts.google.com/) Font by Google

# Usage

You can use any web application and possible to use two ways

-   [CDN link](https://cdn.jsdelivr.net/gh/matheusmelchiades/yieldstreet-challenge@main/survey.min.js)

```HTML
<script
    type="text/javascript"
    src="https://cdn.jsdelivr.net/gh/matheusmelchiades/yieldstreet-challenge@main/survey.min.js"></script>
```

If you want to use a custom request, you must pass some params in script tag.

```HTML
<script
    type="text/javascript"
    data-api-url="<CUSTOM_API_URL>"
    src="https://cdn.jsdelivr.net/gh/matheusmelchiades/yieldstreet-challenge@main/survey.min.js"></script>
```

The one requirement to handle request function expect is a simple object JSON, then flow of survey will it work well.

```JSON
{
    "status": "success"
}
```

or you can custom the handle request function too. Example

```HTML
<script
    type="text/javascript"
    data-api-url="<CUSTOM_API_URL>"
    data-api-factory-response="(response) => ({ status: response.updated })"
    src="https://cdn.jsdelivr.net/gh/matheusmelchiades/yieldstreet-challenge@main/survey.min.js"></script>
```

-   [Download](xx) JS FILE ​

## Result

This a preview of popup in work.

![result](./docs/medias/result.gif)

## References

-   [without JSX](https://reactjs.org/docs/react-without-jsx.html#gatsby-focus-wrapper) about more how to use Framework without these facilities
-   [Babel Converter](https://babeljs.io/repl/#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=false&corejs=3.21&spec=false&loose=false&code_lz=GYVwdgxgLglg9mABACwKYBt1wBQEpEDeAUIogE6pQhlIA8AJjAG4B8AEhlogO5xnr0AhLQD0jVgG4iAXyJA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=react&prettier=false&targets=&version=7.17.8&externalPlugins=&assumptions=%7B%7D) That's a real time playground, how react transform JSX in js.
-   [jsDelivr](https://www.jsdelivr.com/?docs=gh) Used to can get raw content to anywhere.
