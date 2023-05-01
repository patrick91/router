import {
  Declaration,
  transform as lightningcss,
  DeclarationBlock,
  MediaQuery,
  MediaRule,
  SelectorList,
  Rule,
  Selector,
} from "lightningcss";

import { isRuntimeValue, kebabToCamelCase } from "../runtime/native/utils";
import { ExtractedStyle, StyleSheetRegisterOptions } from "../types";
import { ParseDeclarationOptions, parseDeclaration } from "./parseDeclaration";

export type CssToReactNativeRuntimeOptions = {
  inlineRem?: number | false;
};

/*
 * Converts a CSS file to a collection of style declarations that can be used with the StyleSheet API
 */
export function cssToReactNativeRuntime(
  code: Buffer,
  options: CssToReactNativeRuntimeOptions = {}
): StyleSheetRegisterOptions {
  const declarations = new Map<string, ExtractedStyle | ExtractedStyle[]>();

  lightningcss({
    filename: "style.css", // This is ignored, but required
    code,
    visitor: {
      Rule(rule) {
        extractRule(rule, { ...options, declarations }, options);
        // We have processed this rule, so now delete it from the AST
        return [];
      },
    },
  });

  return {
    declarations: Object.fromEntries(declarations),
  };
}

interface ExtractRuleOptions {
  // The collection of declarations that have been extracted so far. This should be mutated
  declarations: Map<string, ExtractedStyle | ExtractedStyle[]>;
  // Rules may be inside other rules, such as media queries.
  // We can build this this partial rule object as we traverse the tree
  style?: Partial<ExtractedStyle>;
}

function extractRule(
  rule: Rule,
  extractOptions: ExtractRuleOptions,
  parseOptions: CssToReactNativeRuntimeOptions
) {
  switch (rule.type) {
    case "media": {
      extractMedia(rule.value, extractOptions, parseOptions);
      break;
    }
    case "style": {
      if (rule.value.declarations) {
        setStyleForSelectorList(
          {
            ...extractOptions.style,
            ...getExtractedStyle(rule.value.declarations, parseOptions),
          },
          rule.value.selectors,
          extractOptions
        );
      }
      break;
    }
  }
}

/*
 * Extracts styles from a media query
 */
function extractMedia(
  mediaRule: MediaRule,
  extractOptions: ExtractRuleOptions,
  parseOptions: CssToReactNativeRuntimeOptions
) {
  const media: MediaQuery[] = [];

  // We only want to extract styles for screen media queries
  for (const mediaQuery of mediaRule.query.mediaQueries) {
    let isScreen = mediaQuery.mediaType !== "print";
    if (mediaQuery.qualifier === "not") {
      isScreen = !isScreen;
    }

    if (isScreen) {
      media.push(mediaQuery);
    }
  }

  // If there are no screen media queries, we don't need to extract anything
  if (media.length === 0) {
    return;
  }

  const newExtractOptions: ExtractRuleOptions = {
    ...extractOptions,
    style: {
      media,
    },
  };

  for (const rule of mediaRule.rules) {
    extractRule(rule, newExtractOptions, parseOptions);
  }

  return undefined;
}

function setStyleForSelectorList(
  style: ExtractedStyle,
  selectorList: SelectorList,
  { declarations }: ExtractRuleOptions
) {
  for (const selector of selectorList) {
    // There maybe multiple className selectors. The last one is the one we want to use
    // The others are conditions
    const classSelectorIndex = findLastIndex(
      selector,
      (s) => s.type === "class"
    );

    // No class selecor, so we can't extract anything
    if (classSelectorIndex === -1) {
      continue;
    }

    const conditions = groupSelector(selector.slice(0, classSelectorIndex));

    if (conditions.length > 0) {
      continue;
    }

    // These conditions need to be added to the declarations
    for (const condition of conditions) {
      addDeclaration(
        condition.className,
        {
          style: {},
          runtimeStyleProps: [],
          variableProps: [],
        },
        declarations
      );
    }

    const groupedDelecarationSelectors = groupSelector(
      selector.slice(classSelectorIndex)
    );

    // We started at the last className, but that doesn't guarentee that we will get a single
    // groupSelector. If we get anything else but one, ignore this selector
    if (groupedDelecarationSelectors.length !== 1) {
      continue;
    }

    const [{ className }] = groupedDelecarationSelectors;

    addDeclaration(className, { ...style }, declarations);
  }
}

function addDeclaration(
  className: string,
  style: ExtractedStyle,
  declarations: ExtractRuleOptions["declarations"]
) {
  const existing = declarations.get(className);

  if (Array.isArray(existing)) {
    existing.push(style);
  } else if (existing) {
    declarations.set(className, [existing, style]);
  } else {
    declarations.set(className, style);
  }
}

type GroupedSelector = {
  className: string;
  pseudoClasses?: Record<string, true>;
};

function groupSelector(selectors: Selector) {
  let current: GroupedSelector | undefined;
  const groupedSelectors: GroupedSelector[] = [];

  for (const selector of selectors) {
    switch (selector.type) {
      case "combinator":
      case "universal":
      case "namespace":
      case "type":
      case "id":
      case "pseudo-element":
      case "nesting":
      case "attribute":
        current = undefined;
        break;
      case "class":
        // Selectors like .foo.bar are not valid
        if (current?.className) {
          groupedSelectors.pop();
          return [];
        } else {
          current = {
            className: selector.name,
          };
          groupedSelectors.push(current);
        }
        break;
      case "pseudo-class":
        switch (selector.kind) {
          case "hover":
          case "active":
          case "focus":
            if (!current) break;
            current.pseudoClasses ??= {};
            current.pseudoClasses[selector.kind] = true;
            break;
          case "not":
          case "first-child":
          case "last-child":
          case "only-child":
          case "root":
          case "empty":
          case "scope":
          case "nth-child":
          case "nth-last-child":
          case "nth-col":
          case "nth-last-col":
          case "nth-of-type":
          case "nth-last-of-type":
          case "first-of-type":
          case "last-of-type":
          case "only-of-type":
          case "host":
          case "where":
          case "is":
          case "any":
          case "has":
          case "lang":
          case "dir":
          case "focus-visible":
          case "focus-within":
          case "current":
          case "past":
          case "future":
          case "playing":
          case "paused":
          case "seeking":
          case "buffering":
          case "stalled":
          case "muted":
          case "volume-locked":
          case "fullscreen":
          case "defined":
          case "any-link":
          case "link":
          case "local-link":
          case "target":
          case "target-within":
          case "visited":
          case "enabled":
          case "disabled":
          case "read-only":
          case "read-write":
          case "placeholder-shown":
          case "default":
          case "checked":
          case "indeterminate":
          case "blank":
          case "valid":
          case "invalid":
          case "in-range":
          case "out-of-range":
          case "required":
          case "optional":
          case "user-valid":
          case "user-invalid":
          case "autofill":
          case "local":
          case "global":
          case "webkit-scrollbar":
          case "custom":
          case "custom-function":
            break;
        }
        break;
    }
  }

  return groupedSelectors;
}

function getExtractedStyle(
  declarationBlock: DeclarationBlock<Declaration>,
  options: CssToReactNativeRuntimeOptions
): ExtractedStyle {
  const extrtactedStyle: ExtractedStyle = {
    style: {},
    runtimeStyleProps: [],
    variableProps: [],
  };

  const declarationArray = [
    declarationBlock.declarations,
    declarationBlock.importantDeclarations,
  ]
    .flat()
    .filter((d): d is Declaration => !!d);

  /*
   * Adds a style property to the rule record.
   *
   * The shorthand option handles if the style came from a long or short hand property
   * E.g. `margin` is a shorthand property for `margin-top`, `margin-bottom`, `margin-left` and `margin-right`
   *
   * The `append` option allows the same property to be added multiple times
   * E.g. `transform` accepts an array of transforms
   */
  function addStyleProp(
    property: string,
    value: any,
    { shortHand = false, append = false } = {}
  ) {
    if (value === undefined) {
      return;
    }

    if (property.startsWith("--")) {
      extrtactedStyle.variableProps.push(property);
    } else {
      property = kebabToCamelCase(property);
    }

    const style = extrtactedStyle.style;

    if (append) {
      const styleValue = style[property];
      if (Array.isArray(styleValue)) {
        styleValue.push(...value);
      } else {
        style[property] = [value];
      }
    } else if (shortHand) {
      // If the shorthand property has already been set, don't overwrite it
      // The longhand property always have priority
      style[property] ??= value;
    } else {
      style[property] = value;
    }

    if (isRuntimeValue(value)) {
      extrtactedStyle.runtimeStyleProps.push(property);
    }
  }

  const parseDeclarationOptions: ParseDeclarationOptions = {
    ...options,
    addStyleProp,
  };

  for (const declaration of declarationArray) {
    parseDeclaration(declaration, parseDeclarationOptions);
  }

  return extrtactedStyle;
}

function findLastIndex<T>(array: T[], predicate: (arg: T) => boolean) {
  for (let index = array.length - 1; index >= 0; index--) {
    if (predicate(array[index])) {
      return index;
    }
  }
  return -1;
}
