# Polybrain Plugin

The Chrome Plugin for the polybrain modeler:

<iframe width="560" height="315" src="https://www.youtube.com/embed/pkFvQh476Wk?si=B6o1UnkYbcJxDTeM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Project Structure

- src/react: The react app for the user-facing plugin
- src/entry: Scripts to connect the react app to the OnShape molder
- dist: Chrome Extension directory
- dist/js: Generated JavaScript files

## Setup

```
npm install
```

## Build

```
npm run build
```

## Load extension to chrome

Load `dist` directory
