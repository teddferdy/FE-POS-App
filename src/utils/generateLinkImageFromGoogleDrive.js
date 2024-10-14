export const generateLinkImageFromGoogleDrive = (string) => {
  if (string) {
    const RAW_URL1 = string?.split("/d/") || "";
    const RAW_URL2 = RAW_URL1?.[1]?.split("/view");
    const IMAGE_ID = RAW_URL2?.[0];
    return `https://lh3.googleusercontent.com/d/${IMAGE_ID}=s500?authuser=0`;
  }
  return;
};
