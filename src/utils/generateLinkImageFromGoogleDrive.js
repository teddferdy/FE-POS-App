export const generateLinkImageFromGoogleDrive = (string) => {
  if (string) {
    const linkImage = string.replace("https://drive.google.com/uc?id=", "");
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${linkImage}&sz=w1000`;
    return thumbnailUrl;
  }
  console.error("Invalid Google Drive URL: ", string);
  return "";
};
