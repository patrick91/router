import React, { ComponentType, useEffect, useRef, forwardRef } from "react";
import { View, Text } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import {
  ContainerRuntime,
  ExtractedAnimations,
  Interaction,
  Style,
  StyleProp,
} from "../../types";
import { FlattenStyleOptions } from "./flattenStyle";
import { animationMap, styleMetaMap } from "./globals";
import {
  cssCountToNumber,
  cssTimeToNumber,
  cssTimingFunctionToEasing,
} from "./utils";

export interface AnimationStylesWrapperProps {
  component: ComponentType<any>;
}

type AnimationInteropProps = Record<string, unknown> & {
  __component: ComponentType<any>;
  __interaction: Interaction;
  __variables: Record<string, unknown>;
  __containers: Record<string, ContainerRuntime>;
  __propEntries: [string, Style][];
  __hasAnimation: boolean;
  __hasTransition: boolean;
};

export const AnimationInterop = forwardRef(function Animated(
  {
    __component: Component,
    __propEntries,
    __interaction,
    __variables,
    __containers,
    __hasAnimation,
    __hasTransition,
    ...props
  }: AnimationInteropProps,
  ref: unknown
) {
  Component = createAnimatedComponent(Component);

  /* eslint-disable react-hooks/rules-of-hooks */
  for (const [name, value] of __propEntries) {
    if (__hasTransition && __hasAnimation) {
      props[name] = [
        value,
        useTransitions(value),
        useAnimations(value, {
          variables: __variables,
          interaction: __interaction,
          containers: __containers,
        }),
      ];
    } else if (__hasTransition) {
      props[name] = [value, useTransitions(value)];
    } else {
      props[name] = [
        value,
        useAnimations(value, {
          variables: __variables,
          interaction: __interaction,
          containers: __containers,
        }),
      ];
    }
  }

  /* eslint-enable react-hooks/rules-of-hooks */
  return <Component ref={ref} {...props} />;
});

const animatedCache = new WeakMap<ComponentType<any>, ComponentType<any>>([
  [View, Animated.View],
  [Animated.View, Animated.View],
  [Text, Animated.Text],
  [Animated.Text, Animated.Text],
]);

export function createAnimatedComponent(
  Component: ComponentType<any>
): ComponentType<any> {
  if (animatedCache.has(Component)) {
    return animatedCache.get(Component)!;
  } else if (Component.displayName?.startsWith("AnimatedComponent")) {
    return Component;
  }

  if (
    !(
      typeof Component !== "function" ||
      (Component.prototype && Component.prototype.isReactComponent)
    )
  ) {
    throw new Error(
      `Looks like you're passing an animation style to a function component \`${Component.name}\`. Please wrap your function component with \`React.forwardRef()\` or use a class component instead.`
    );
  }

  const AnimatedComponent = Animated.createAnimatedComponent(
    Component as React.ComponentClass
  );

  animatedCache.set(Component, AnimatedComponent);

  return AnimatedComponent;
}

export function useAnimations(
  style: Style,
  options: FlattenStyleOptions
): StyleProp {
  const styleMetadata = styleMetaMap.get(style);

  if (!styleMetadata?.animations?.name) {
    return style;
  }

  const $style = [];

  /* eslint-disable react-hooks/rules-of-hooks */
  for (let index = 0; index < styleMetadata?.animations?.name.length; index++) {
    $style.push(useAnimation(styleMetadata.animations, index, options));
  }
  /* eslint-enable react-hooks/rules-of-hooks */

  return $style;
}

function useAnimation(
  animations: ExtractedAnimations,
  index: number,
  _options: FlattenStyleOptions
) {
  const animationName = getAnimationValue(animations.name, index, {
    type: "none",
  });

  const name = animationName.type === "none" ? "none" : animationName.value;

  const direction = getAnimationValue(animations.direction, index, "normal");
  const duration = cssTimeToNumber(
    getAnimationValue(animations.duration, index, { type: "seconds", value: 0 })
  );
  const timingFunction = cssTimingFunctionToEasing(
    getAnimationValue(animations.timingFunction, index, { type: "linear" })
  );
  const iterationCount = cssCountToNumber(
    getAnimationValue(animations.iterationCount, index, {
      type: "number",
      value: 1,
    })
  );

  const fillMode = getAnimationValue(animations.fillMode, index, "none");

  // This keeps track of the progress across all frames
  const animatedFrameIndex = useSharedValue(0);

  const keyframes = animationMap.get(name) ?? [];

  useEffect(() => {
    // Restart the animation anytime any of the animation's properties change
    // Or the component is remounted
    animatedFrameIndex.value = 0;

    const timingFrames: number[] = [];
    for (let index = 0; index < keyframes.length - 1; index++) {
      const from = keyframes[index];
      const to = keyframes[index + 1];

      timingFrames.push(
        withTiming(index + 1, {
          duration: duration * ((to.selector - from.selector) / 100),
          easing: timingFunction,
        })
      );
    }

    switch (direction) {
      case "normal":
        break;
      case "reverse":
        timingFrames.reverse();
        break;
      case "alternate":
      case "alternate-reverse":
        // TODO
        break;
    }

    switch (fillMode) {
      case "none":
        // Immedately loop back to the first frame
        // timingFrames.push(withTiming(0, { duration: 0 }));
        break;
      case "backwards":
      case "forwards":
      case "both":
        // TODO
        break;
    }

    const [firstFrame, ...sequence] = timingFrames;

    animatedFrameIndex.value = withRepeat(
      withSequence(firstFrame, ...sequence),
      iterationCount
    );
  }, [keyframes, duration, timingFunction, iterationCount]);

  return useAnimatedStyle(() => {
    const frameProgress = animatedFrameIndex.value % 1;

    const from = Math.floor(animatedFrameIndex.value);
    const to = from + 1;

    if (from >= keyframes.length - 1) {
      return keyframes[from].style;
    }

    const fromStyles = keyframes[from].style;
    const toStyles = keyframes[to].style;

    const style: Record<string, unknown> = {};

    for (const [key, toValue] of Object.entries(toStyles)) {
      let fromValue = fromStyles[key];

      // If the current key is not in the from styles, try to find it in the previous styles
      if (fromValue === undefined) {
        for (let index = from; index > 0; index--) {
          if (fromStyles[key]) {
            fromValue = fromStyles[key];
            break;
          }
        }
      }

      if (key === "transform") {
        const fromTransform = fromValue as Record<string, unknown>;
        const toTransform = toValue as Record<string, unknown>;

        style[key] = transformKeys
          .filter((key) => {
            return key in fromTransform || key in toTransform;
          })
          .map((key) => {
            return {
              [key]: interpolateWithUnits(
                frameProgress,
                fromTransform[key],
                toTransform[key]
              ),
            };
          });
      } else {
        style[key] = interpolateWithUnits(frameProgress, fromValue, toValue);
      }
    }

    return style;
  }, [animatedFrameIndex]);
}

export function useTransitions(style: Style): StyleProp {
  const transition = styleMetaMap.get(style)?.transition;

  const previous = useRef<Record<string, any>>({ ...style });

  const dependencies: any[] = [];
  const numericTuples: any[] = [];
  const colorTuples: any[] = [];
  const properties = transition?.property || [];

  for (let index = 0; index < properties.length; index++) {
    const prop = properties[index];
    const duration = transition?.duration?.[
      index % (transition?.duration.length || 0)
    ] || { type: "milliseconds", value: 0 };

    switch (prop) {
      // case "transform":
      // case "translate":
      // case "rotate":
      // case "scale":
      case "order":
        continue;
      case "borderBottomLeftRadius":
      case "borderBottomRightRadius":
      case "borderBottomWidth":
      case "borderLeftWidth":
      case "borderRadius":
      case "borderRightWidth":
      case "borderTopWidth":
      case "borderWidth":
      case "bottom":
      case "flex":
      case "flexBasis":
      case "flexGrow":
      case "flexShrink":
      case "fontSize":
      case "fontWeight":
      case "gap":
      case "height":
      case "left":
      case "letterSpacing":
      case "lineHeight":
      case "margin":
      case "marginBottom":
      case "marginLeft":
      case "marginRight":
      case "marginTop":
      case "maxHeight":
      case "maxWidth":
      case "minHeight":
      case "minWidth":
      case "objectPosition":
      case "opacity":
      case "padding":
      case "paddingBottom":
      case "paddingLeft":
      case "paddingRight":
      case "paddingTop":
      case "right":
      case "textDecoration":
      case "top":
      case "transformOrigin":
      case "verticalAlign":
      case "visibility":
      case "width":
      case "wordSpacing":
      case "zIndex": {
        /* eslint-disable react-hooks/rules-of-hooks */
        const value = style[prop as keyof Style] as string;
        const progress = useSharedValue<number>(0);
        const ref = useRef<[string, string]>([value, value]);

        if (value === undefined) {
          break;
        }

        if (ref.current[0] !== value) {
          progress.value = 0;
          progress.value = withTiming(1, {
            duration: cssTimeToNumber(duration),
          });
          ref.current = [ref.current[1], value];
        }
        numericTuples.push([prop, progress, ref.current]);
        break;
        /* eslint-enable react-hooks/rules-of-hooks */
      }
      case "backgroundColor":
      case "borderBottomColor":
      case "borderLeftColor":
      case "borderRightColor":
      case "borderTopColor":
      case "color": {
        /* eslint-disable react-hooks/rules-of-hooks */
        const value = style[prop as keyof Style] as string;
        const progress = useSharedValue<number>(0);
        const ref = useRef<[string, string]>([value, value]);

        if (value === undefined) {
          break;
        }

        if (ref.current[0] !== value) {
          progress.value = 0;
          progress.value = withTiming(1, {
            duration: cssTimeToNumber(duration),
          });
          ref.current = [ref.current[1], value];
        }

        colorTuples.push([prop, progress, ref.current]);
        break;
        /* eslint-enable react-hooks/rules-of-hooks */
      }
    }
  }

  return useAnimatedStyle(() => {
    const style: Record<string, unknown> = {};
    for (let index = 0; index < numericTuples.length; index++) {
      const [prop, progress, ref] = numericTuples[index];
      style[prop] = interpolate(progress.value, [0, 1], ref);
    }

    for (let index = 0; index < colorTuples.length; index++) {
      const [prop, progress, ref] = colorTuples[index];
      style[prop] = interpolateColor(progress.value, [0, 1], ref);
    }

    return style;
  }, [...numericTuples, ...colorTuples]);
}

function interpolateWithUnits(
  progress: number,
  from: unknown = 0,
  to: unknown = 0
) {
  if (typeof from === "number" && typeof to === "number") {
    return interpolate(progress, [0, 1], [from, to]);
  } else if (
    (typeof from === "string" && typeof to === "string") ||
    (typeof from === "string" && to === 0)
  ) {
    const unit = from.match(/[a-z%]+$/)?.[0];

    if (unit) {
      return `${interpolate(
        progress,
        [0, 1],
        [Number.parseFloat(from), Number.parseFloat(to.toString())]
      )}${unit}`;
    }
  } else if (typeof to === "string" && from === 0) {
    const unit = to.match(/[a-z%]+$/)?.[0];

    if (unit) {
      return `${interpolate(
        progress,
        [0, 1],
        [from, Number.parseFloat(to)]
      )}${unit}`;
    }
  }

  return 0;
}

const transformKeys = Object.keys({
  perspective: 1,
  translateX: 1,
  translateY: 1,
  scaleX: 1,
  scaleY: 1,
  rotate: 1,
  rotateX: 1,
  rotateY: 1,
  rotateZ: 1,
  skewX: 1,
  skewY: 1,
  scale: 1,
});

function getAnimationValue<T>(
  array: T[] | undefined,
  index: number,
  defaultValue: T
) {
  if (!array) return defaultValue;
  return array[index % array.length];
}
