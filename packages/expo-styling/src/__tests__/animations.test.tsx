import { render } from "@testing-library/react-native";
import React from "react";

import { StyleSheet } from "../runtime/native/stylesheet";
import { createMockComponent, registerCSS } from "./utils";

const A = createMockComponent();

jest.useFakeTimers();

beforeEach(() => {
  StyleSheet.__reset();
});

test("basic animation", () => {
  registerCSS(`
.my-class {
  animation-duration: 3s;
  animation-name: slidein;
}

@keyframes slidein {
  from {
    margin-left: 100%;
  }

  to {
    margin-left: 0%;
  }
}
`);

  const testComponent = render(
    <A testID="test" className="my-class" />
  ).getByTestId("test");

  expect(testComponent).toHaveAnimatedStyle({
    marginLeft: "100%",
  });

  jest.advanceTimersByTime(1500);

  expect(testComponent).toHaveAnimatedStyle({
    marginLeft: "50%",
  });

  jest.advanceTimersByTime(1500);

  expect(testComponent).toHaveAnimatedStyle({
    marginLeft: "0%",
  });
});

test("single frame", () => {
  registerCSS(`
    .my-class {
      animation-duration: 3s;
      animation-name: spin;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
`);

  const testComponent = render(
    <A testID="test" className="my-class" />
  ).getByTestId("test");

  expect(testComponent).toHaveAnimatedStyle({
    transform: [{ rotate: "0deg" }],
  });

  jest.advanceTimersByTime(1500);

  expect(testComponent).toHaveAnimatedStyle({
    transform: [{ rotate: "180deg" }],
  });

  jest.advanceTimersByTime(1500);

  expect(testComponent).toHaveAnimatedStyle({
    transform: [{ rotate: "360deg" }],
  });
});

test("transform - starting", () => {
  registerCSS(`
    .my-class {
      animation-duration: 3s;
      animation-name: spin;
      transform: rotate(180deg);
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
`);

  const testComponent = render(
    <A testID="test" className="my-class" />
  ).getByTestId("test");

  expect(testComponent).toHaveAnimatedStyle({
    transform: [{ rotate: "180deg" }],
  });

  jest.advanceTimersByTime(1500);

  expect(testComponent).toHaveAnimatedStyle({
    transform: [{ rotate: "270deg" }],
  });

  jest.advanceTimersByTime(1500);

  expect(testComponent).toHaveAnimatedStyle({
    transform: [{ rotate: "360deg" }],
  });
});
