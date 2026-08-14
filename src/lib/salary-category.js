const SALARY_CATEGORY_PATTERN = /gaji|salary|upah|wage/i;

export const isSalaryCategoryName = (name) => SALARY_CATEGORY_PATTERN.test(name || "");
