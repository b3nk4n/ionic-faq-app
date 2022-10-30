export const isBlank = (value: string | null | undefined): boolean => {
  return value == null || value.trim() === "";
};

export const isNotBlank = (value: string | null | undefined): boolean => {
  return !isBlank(value);
};
