export const processClinicData = (data: string): string => {
  return data.trim().replace(/\n{3,}/g, '\n\n');
};
