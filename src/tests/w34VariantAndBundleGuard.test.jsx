import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import VariantModal from "../page/cashier/components/VariantModal";
import CartPanel from "../page/cashier/components/CartPanel";
import { normalizeCatalogProduct } from "../utils/catalogPrice";

// W3-4 (K3): option and modifier selections stay separate and are priced on
// the authoritative effective base; bundle lines never offer a price
// override (the server rejects bundle overrides).

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k, opts) => (typeof opts === "string" ? opts : k) })
}));

const latte = normalizeCatalogProduct({
  id: 2,
  nameProduct: "Latte",
  price: 10000,
  effectivePrice: 12000,
  isOption: true,
  options: [{ name: "Size", options: [{ name: "Large", price: 2000 }] }],
  hasModifiers: true,
  modifiers: [{ name: "Extra Shot", price: 3000 }]
});

describe("W3-4 VariantModal selections (K3)", () => {
  test("emits the option and the modifier separately, priced on the effective base", () => {
    const onSelect = jest.fn();
    render(<VariantModal product={latte} onSelect={onSelect} onClose={jest.fn()} />);

    fireEvent.click(screen.getByText("Large"));
    fireEvent.click(screen.getByText("Extra Shot"));
    fireEvent.click(screen.getByText("page.cashier.addToCart"));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        // effectivePrice 12000 + option 2000 + modifier 3000
        price: 17000,
        label: "Size - Large + Extra Shot",
        options: [{ name: "Size - Large" }],
        modifiers: [{ name: "Extra Shot" }]
      })
    );
  });

  test("an option-only choice keeps the existing label and sends no modifiers", () => {
    const onSelect = jest.fn();
    render(<VariantModal product={latte} onSelect={onSelect} onClose={jest.fn()} />);

    fireEvent.click(screen.getByText("Large"));
    fireEvent.click(screen.getByText("page.cashier.addToCart"));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        price: 14000,
        label: "Size - Large",
        options: [{ name: "Size - Large" }],
        modifiers: []
      })
    );
  });
});

const cartProps = (items) => ({
  items,
  subtotal: items.reduce((sum, item) => sum + item.totalPrice, 0),
  taxRate: 0,
  taxAmount: 0,
  onIncrement: jest.fn(),
  onDecrement: jest.fn(),
  onDelete: jest.fn(),
  onCheckout: jest.fn(),
  totalItems: items.length
});

describe("W3-4 CartPanel bundle price guard (K3)", () => {
  test("a bundle line offers no price override even to an authorized role", () => {
    const bundle = {
      cartKey: "bundle:7",
      id: 7,
      bundleId: 7,
      isBundle: true,
      nameProduct: "Paket",
      price: 50000,
      count: 1,
      totalPrice: 50000
    };
    render(<CartPanel {...cartProps([bundle])} canEditPrice onUpdatePrice={jest.fn()} />);
    expect(screen.queryByLabelText("Edit price")).not.toBeInTheDocument();
  });

  test("a product line next to a bundle still offers the override to an authorized role", () => {
    const product = {
      cartKey: "1_",
      id: 1,
      nameProduct: "Kopi",
      price: 12000,
      count: 1,
      totalPrice: 12000
    };
    const bundle = {
      cartKey: "bundle:7",
      id: 7,
      bundleId: 7,
      isBundle: true,
      nameProduct: "Paket",
      price: 50000,
      count: 1,
      totalPrice: 50000
    };
    render(<CartPanel {...cartProps([product, bundle])} canEditPrice onUpdatePrice={jest.fn()} />);
    expect(screen.getAllByLabelText("Edit price")).toHaveLength(1);
  });
});
