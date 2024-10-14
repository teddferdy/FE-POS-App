export const generateLinkImageFromGoogleDrive = (string) => {
  if (string) {
    const fileId = string.match(/id=([a-zA-Z0-9_-]+)/)?.[1];
    if (fileId) {
      const link = `https://drive.google.com/uc?id=${fileId}`;
      console.log("Generated Image Link: ", link);
      return link;
    }
  }
  console.error("Invalid Google Drive URL: ", string);
  return "";
};
