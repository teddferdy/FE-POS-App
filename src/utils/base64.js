export const convertToBase64 = async (url) => {
  console.log("URL =>", url);

  const response = await fetch(url);
  const blob = await response.blob();
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      resolve(reader.result); // Base64 string
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob); // Convert to Base64
  });
};
