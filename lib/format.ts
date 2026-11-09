export const peso = (n: number) =>
  "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const pesoShort = (n: number) => "₱" + n.toLocaleString("en-PH");
