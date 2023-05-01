import matchers from "expect/build/matchers";

matchers.customTesters = [];

expect.extend({
  styleToEqual(received, style) {
    const receivedStyle = received.component.mock.lastCall[0].style;

    const newObj: Record<string, unknown> = {};
    for (const prop in receivedStyle) {
      if (receivedStyle.hasOwnProperty(prop)) {
        newObj[prop] = receivedStyle[prop];
      }
    }

    return matchers.toEqual(newObj, style);
  },
});
