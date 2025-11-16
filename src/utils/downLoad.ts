// src/utils/download.ts
export const downloadFile = async (url: string, filename: string) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");

        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();

        // Clean up
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error("Error downloading file:", error);
    }
};
