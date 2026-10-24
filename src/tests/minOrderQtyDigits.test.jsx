import { digitsOnly } from "../utils/quantity";

// BA DR-28 decision 4: the supplier product "Min Order" takes digits only;
// the BE stores it as a whole number.

test.each([
  ["12", "12"],
  ["10 karton", "10"],
  ["1.5", "15"],
  ["-3", "3"],
  ["", ""],
  [null, ""],
  [undefined, ""],
  [7, "7"]
])("digitsOnly(%p) = %p", (input, expected) => {
  expect(digitsOnly(input)).toBe(expected);
});
