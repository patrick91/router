import {
  Declaration,
  transform as lightningcss,
  DeclarationBlock,
  MediaQuery,
  MediaRule,
  SelectorList,
  Rule,
} from "lightningcss";

import { ParseDeclarationOptions, parseDeclaration } from "./parseDeclaration";
import { isRuntimeValue } from "../runtime/native/guards";
import { ExtractedStyle, StyleSheetRegisterOptions } from "../types";

interface GetVisitorOptions {
  declarations: Map<string, ExtractedStyle | ExtractedStyle[]>;
}

export type CssToReactNativeRuntimeOptions = ParseDeclarationOptions;

/**
 * LightningCSS visitor that converts CSS to React Native styles
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
        extractRule(rule, { declarations }, options);
        // We have processed this rule, so now delete it from the AST
        return [];
      },
    },
  });

  return {
    declarations: Object.fromEntries(declarations),
  };
}

function extractRule(
  rule: Rule,
  { declarations }: GetVisitorOptions,
  options: ParseDeclarationOptions
) {
  switch (rule.type) {
    case "media": {
      extractedMedia(rule.value, declarations, options);
      break;
    }
    case "style": {
      if (rule.value.declarations) {
        setStyleForSelectorList(
          getExtractedStyle(rule.value.declarations, options),
          rule.value.selectors,
          declarations
        );
      }
      break;
    }
  }
}

function setStyleForSelectorList(
  style: ExtractedStyle,
  selectorList: SelectorList,
  declarations: GetVisitorOptions["declarations"]
) {
  for (const selectors of selectorList) {
    for (const selector of selectors) {
      if (selector.type === "class") {
        const existing = declarations.get(selector.name);

        if (Array.isArray(existing)) {
          existing.push(style);
        } else if (existing) {
          declarations.set(selector.name, [existing, style]);
        } else {
          declarations.set(selector.name, style);
        }
      }
    }
  }
}

function extractedMedia(
  mediaRule: MediaRule,
  declarations: GetVisitorOptions["declarations"],
  options: ParseDeclarationOptions
) {
  const media: MediaQuery[] = [];

  for (const mediaQuery of mediaRule.query.mediaQueries) {
    let isScreen = mediaQuery.mediaType !== "print";
    if (mediaQuery.qualifier === "not") {
      isScreen = !isScreen;
    }

    if (isScreen) {
      media.push(mediaQuery);
    }
  }

  if (media.length === 0) {
    return;
  }

  for (const rule of mediaRule.rules) {
    if (rule.type === "style" && rule.value.declarations) {
      const extractedStyle = getExtractedStyle(
        rule.value.declarations,
        options
      );

      setStyleForSelectorList(
        { ...extractedStyle, media },
        rule.value.selectors,
        declarations
      );
    }
  }

  return undefined;
}

function getExtractedStyle(
  declarationBlock: DeclarationBlock<Declaration>,
  options: ParseDeclarationOptions
): ExtractedStyle {
  const style: Record<string, any> = {};
  const runtimeStyleProps: string[] = [];
  const variableProps: string[] = [];

  const declarationArray = [
    declarationBlock.declarations,
    declarationBlock.importantDeclarations,
  ]
    .flat()
    .filter((d): d is Declaration => !!d);

  /*
   * Adds a style property to the rule record. Use nullish coalescing to control setting shorthand vs longhand
   *
   * For example, margin-right should use `nullishCoalescing=false`, but margin should use `true`
   * This is because margin-right is a longhand property of margin, so it should override the shorthand
   *
   * @param property - the property name
   * @param value - the property value
   * @param nullishCoalescing - whether to use nullish coalescing to set the property
   */
  function addStyleProp(
    property: string,
    value: any,
    { nullishCoalescing = false, append = false } = {}
  ) {
    if (value === undefined) {
      return;
    }

    if (property.startsWith("--")) {
      variableProps.push(property);
    } else {
      // RN styles need to be camelCase
      property = property.replace(/-./g, (x) => x[1].toUpperCase());
    }

    if (append) {
      if (Array.isArray(style[property])) {
        style[property].push(...value);
      } else {
        style[property] = [value];
      }
    } else if (nullishCoalescing) {
      style[property] ??= value;
    } else {
      style[property] = value;
    }

    if (isRuntimeValue(value)) {
      runtimeStyleProps.push(property);
    }
  }

  for (const declaration of declarationArray) {
    parseDeclaration(declaration, addStyleProp, options);
  }

  return {
    runtimeStyleProps,
    variableProps,
    style,
  };
}
