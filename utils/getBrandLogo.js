export const getBrandLogo = (brandName, carBrands = []) => {
  if (!brandName || !Array.isArray(carBrands)) return null;

  const brand = carBrands.find(
    b => b?.name?.toLowerCase() === brandName?.toLowerCase()
  );

  return brand?.logo || null;
};
