import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const P = "page.ingredient.form.source";

export const INGREDIENT_SOURCES = ["none", "supplier"];

// Where an ingredient comes from (client note 2026-10-24). "none" is bought
// at the market or made in-house: no supplier, the name is typed in.
// "supplier" is bought from a registered supplier: the supplier is required
// and the name can come from its catalog. Always selectable: the choice
// does not depend on the store (only the supplier list does).
const IngredientSourceField = ({ value, onChange }) => {
  const { t } = useTranslation();
  const source = INGREDIENT_SOURCES.includes(value) ? value : "none";

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {t(`${P}.label`)}
      </legend>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {INGREDIENT_SOURCES.map((option) => (
          <label
            key={option}
            className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm transition-colors ${
              source === option ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
            }`}>
            <input
              type="radio"
              name="ingredientSource"
              value={option}
              checked={source === option}
              onChange={() => onChange(option)}
              className="mt-0.5 accent-primary"
            />
            <span className="space-y-0.5">
              <span className="block font-medium text-foreground">{t(`${P}.${option}`)}</span>
              <span className="block text-xs text-muted-foreground">{t(`${P}.${option}Desc`)}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};

IngredientSourceField.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export default IngredientSourceField;
