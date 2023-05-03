import { render } from "@testing-library/react-native";
import React from "react";

import { StyleSheet } from "../runtime/native/stylesheet";
import { createMockComponent, registerCSS } from "./utils";

const A = createMockComponent();

jest.useFakeTimers();

beforeEach(() => {
  StyleSheet.__reset();
});

test.only("basic animation", () => {
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
