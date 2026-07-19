export const imageToBase64 = async (imagePath) => {
  try {
    let fullPath = imagePath;
    if (!imagePath.startsWith('http')) {
      const normalized = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      fullPath = window.location.origin + normalized;
    }
    const response = await fetch(fullPath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Error converting image to base64:', err);
    return null;
  }
};

export const getCompanyLogoBase64 = async (logoPath) => {
  try {
    return await imageToBase64(logoPath);
  } catch {
    return null;
  }
};
