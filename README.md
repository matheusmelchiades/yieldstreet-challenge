# Yieldstreet Survey Challenge

An embeddable survey popup widget built with **React without JSX** — distributed as a single script tag via CDN. This technical challenge demonstrates deep understanding of React internals by using `React.createElement` directly instead of JSX syntax.

## Tech Stack

- **React** (without JSX) — using `React.createElement` directly
- - **ReactDOM** — for DOM rendering
  - - **Material UI** — component library for polished UI
    - - **jsDelivr CDN** — for script distribution
     
      - ## Features
     
      - - **Drop-in Integration** — embed with a single `<script>` tag
        - - **Custom API Endpoint** — configure via `data-api-url` attribute
          - - **Custom Response Handler** — define response parsing via `data-api-factory-response`
            - - **Zero Build Step** — works directly in any web page
             
              - ## Usage
             
              - ### Basic Integration
             
              - ```html
                <script
                  type="text/javascript"
                  src="https://cdn.jsdelivr.net/gh/matheusmelchiades/yieldstreet-challenge@main/survey.min.js">
                </script>
                ```

                ### With Custom API

                ```html
                <script
                  type="text/javascript"
                  data-api-url="<YOUR_API_URL>"
                  src="https://cdn.jsdelivr.net/gh/matheusmelchiades/yieldstreet-challenge@main/survey.min.js">
                </script>
                ```

                ### With Custom Response Handler

                ```html
                <script
                  type="text/javascript"
                  data-api-url="<YOUR_API_URL>"
                  data-api-factory-response="(response) => ({ status: response.updated })"
                  src="https://cdn.jsdelivr.net/gh/matheusmelchiades/yieldstreet-challenge@main/survey.min.js">
                </script>
                ```

                The API handler expects a JSON response with `{ "status": "success" }` format. Use the factory response attribute to transform custom API responses.

                ## Why No JSX?

                This project intentionally avoids JSX to demonstrate how React works under the hood. Every component is built using `React.createElement()`, showing a deeper understanding of the framework beyond typical usage. See [React Without JSX](https://reactjs.org/docs/react-without-jsx.html) for more context.
