import React, { ComponentType, useEffect, useReducer } from "react";

import { ContainerRuntime, Style } from "../../types";
import { AnimationInterop } from "./animations";
import { flattenStyle } from "./flattenStyle";
import {
  ContainerContext,
  VariableContext,
  globalStyles,
  styleMetaMap,
} from "./globals";
import { useInteractionHandlers, useInteractionSignals } from "./interaction";
import { useComputation } from "./signals";
import { StyleSheet } from "./stylesheet";
import { useDynamicMemo } from "./utils";

export type CSSInteropWrapperProps = {
  __component: ComponentType<any>;
  __styleKeys: string[];
} & Record<string, any>;

export function defaultCSSInterop(
  jsx: Function,
  type: ComponentType<any>,
  // Props are frozen in development so they need to be cloned
  { ...props }: any,
  key: string
) {
  /*
   * Most styles are static so the CSSInteropWrapper is not needed
   */

  props.__component = type;
  props.__styleKeys = ["style"];

  /**
   * In development, we need to wrap every component due to possible async style changes.
   * This wrapper only subscibes to StyleSheet.register, so it is not a huge performance hit.
   */
  if (__DEV__) {
    return jsx(DevOnlyCSSInteropWrapper, props, key);
  }

  classNameToStyle(props);

  return areStylesDynamic(props.style)
    ? jsx(CSSInteropWrapper, props, key)
    : jsx(type, props, key);
}

/**
 * During development, the user may be using a CSS Postprocess (like Tailwind).
 * React doesn't know when these updates will occur, so we need to subscribe to them.
 * As CSS is static in production, we only need this in development.
 */
const DevOnlyCSSInteropWrapper = React.forwardRef(
  function DevOnlyCSSInteropWrapper(
    { __component: Component, __styleKeys, ...props }: CSSInteropWrapperProps,
    ref
  ) {
    const [, render] = useReducer((acc) => acc + 1, 0);
    useEffect(() => StyleSheet.__subscribe(render), []);

    classNameToStyle(props);

    return areStylesDynamic(props.style) ? (
      <CSSInteropWrapper
        {...props}
        ref={ref}
        __component={Component}
        __styleKeys={__styleKeys}
        __skipCssInterop
      />
    ) : (
      <Component {...props} ref={ref} __skipCssInterop />
    );
  }
);

const CSSInteropWrapper = React.forwardRef(function CSSInteropWrapper(
  { __component: Component, __styleKeys, ...$props }: CSSInteropWrapperProps,
  ref
) {
  const [, rerender] = React.useReducer((acc) => acc + 1, 0);
  const inheritedVariables = React.useContext(VariableContext);
  const inheritedContainers = React.useContext(ContainerContext);

  const inlineVariables: Record<string, unknown>[] = [];
  const inlineContainers: Record<string, ContainerRuntime> | undefined = {};
  const interaction = useInteractionSignals();

  const propEntries: [string, Style][] = [];
  const animatedProps: string[] = [];
  const transitionProps: string[] = [];

  /* eslint-disable react-hooks/rules-of-hooks -- __styleKeys is immutable */
  for (const key of __styleKeys) {
    /*
     * Create a computation that will flatten the style object. Any signals read while the computation
     * is running will be subscribed to.
     */
    const style = useComputation(
      () =>
        flattenStyle($props[key], {
          interaction,
          variables: inheritedVariables,
          containers: inheritedContainers,
        }),
      [$props[key], inheritedVariables, inheritedContainers],
      rerender
    );

    const meta = styleMetaMap.get(style);
    propEntries.push([key, style]);

    if (meta?.variables) inlineVariables.push(meta.variables);
    if (meta?.animations) animatedProps.push(key);
    if (meta?.transition) transitionProps.push(key);
    if (meta?.container) {
      if (meta.container.names) {
        for (const name of meta.container.names) {
          inlineContainers[name] = {
            type: meta.container.type,
            interaction,
            style,
          };
        }
      }

      inlineContainers.__default = {
        type: meta.container.type,
        interaction,
        style,
      };
    }
  }
  /* eslint-enable react-hooks/rules-of-hooks */

  const variables = useDynamicMemo(
    () => Object.assign({}, inheritedVariables, ...inlineVariables),
    [inheritedVariables, ...inlineVariables]
  );

  const inlineContainerValues = Object.values(inlineContainers);
  const containers = useDynamicMemo(
    () => Object.assign({}, inheritedContainers, inlineContainers),
    [inheritedContainers, ...inlineContainerValues]
  );

  const props = Object.assign(
    {},
    $props,
    useInteractionHandlers(
      $props,
      interaction,
      inlineContainerValues.length > 0
    )
  );

  let children: JSX.Element = props.children;

  if (inlineVariables.length > 0) {
    children = (
      <VariableContext.Provider value={variables}>
        {children}
      </VariableContext.Provider>
    );
  }

  if (inlineContainerValues.length > 0) {
    children = (
      <ContainerContext.Provider value={containers}>
        {children}
      </ContainerContext.Provider>
    );
  }

  if (animatedProps.length > 0 || transitionProps.length > 0) {
    return (
      <AnimationInterop
        {...props}
        ref={ref}
        __component={Component}
        __propEntries={propEntries}
        __variables={variables}
        __containers={inheritedContainers}
        __interaction={interaction}
        __hasAnimation={animatedProps.length > 0}
        __hasTransition={transitionProps.length > 0}
        __skipCssInterop
      >
        {children}
      </AnimationInterop>
    );
  } else {
    return (
      <Component
        {...props}
        {...Object.fromEntries(propEntries)}
        ref={ref}
        __skipCssInterop
      >
        {children}
      </Component>
    );
  }
});

function classNameToStyle(props: Record<string, unknown>) {
  if (typeof props.className === "string") {
    const classNameStyle = props.className
      .split(/\s+/)
      .map((s) => globalStyles.get(s));

    props.style = Array.isArray(props.style)
      ? [...classNameStyle, ...props.style]
      : props.style
      ? [...classNameStyle, props.style]
      : classNameStyle;

    if (Array.isArray(props.style) && props.style.length <= 1) {
      props.style = props.style[0];
    }

    delete props.className;
  }
}

function areStylesDynamic(style: any) {
  if (!style) {
    return false;
  }

  // Some array styles are pre-tagged
  if (styleMetaMap.has(style)) {
    return true;
  }

  if (Array.isArray(style) && style.some(areStylesDynamic)) {
    // If this wasn't tagged before, tag it now so we don't have to
    // traget it again
    styleMetaMap.set(style, {});
    return true;
  }

  return false;
}
