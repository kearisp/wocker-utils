# @wocker/utils

###### Utils for wocker packages

[![npm version](https://img.shields.io/npm/v/@wocker/utils.svg)](https://www.npmjs.com/package/@wocker/utils)
[![Publish latest](https://github.com/kearisp/wocker-utils/actions/workflows/publish-latest.yml/badge.svg?event=release)](https://github.com/kearisp/wocker-utils/actions/workflows/publish-latest.yml)
[![License](https://img.shields.io/npm/l/@wocker/utils)](https://github.com/kearisp/wocker-utils/blob/master/LICENSE)

[![npm total downloads](https://img.shields.io/npm/dt/@wocker/utils.svg)](https://www.npmjs.com/package/@wocker/utils)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@wocker/utils)](https://bundlephobia.com/package/@wocker/utils)
![Coverage](https://gist.githubusercontent.com/kearisp/f17f46c6332ea3bb043f27b0bddefa9f/raw/coverage-wocker-utils-latest.svg)


## Usage

### Installation

```shell
npm i @wocker/utils
```


## Breaking Changes in Version 2.0.0

### Name Changes for Prompt Functions

In version 2.0.0, we've renamed some core prompt functions to improve clarity and consistency across the API. These changes will require updates to your code if you're migrating from v1.x.

#### Function Renaming

| Old Name (v1.x) | New Name (v2.0.0) | Description                     |
|-----------------|-------------------|---------------------------------|
| `promptText`    | `promptInput`     | Prompts the user for text input |
| `promptConfig`  | _Removed_         | Function has been removed       |
| `promptGroup`   | _Removed_         | Function has been removed       |

#### Migration Guide

If you're upgrading from version 1.x to 2.0.0, you'll need to update your imports and function calls for `promptText`:

```typescript
// Old usage (v1.x)
import {promptText} from "@wocker/utils";

const name = await promptText({
    message: "Enter your name"
});
```

```typescript
// New usage (v2.0.0)
import {promptInput} from "@wocker/utils";

const name = await promptInput({
    message: "Enter your name"
});
```


### Why This Change?

We decided to rename the `promptText` function to `promptInput` to:

1. Provide a more descriptive name that better reflects its purpose
2. Create a more consistent naming convention across the API
3. Improve developer experience with more intuitive function names

The `promptConfig` and `promptGroup` functions have been removed as they are no longer supported in the new version.


### Migration

If you're using a large codebase with many occurrences of the old function name, you can use the following search and replace operation:

- Replace all occurrences of `promptText` with `promptInput`
- Remove any usage of `promptConfig` and `promptGroup` as these functions are no longer available

### Additional Information

The function signatures and return types remain the same, only the name of `promptText` has changed. All other functionality works exactly as before.

For any issues or questions regarding this migration, please open an issue on our GitHub repository.
