export const tag_options = [
    { id: "none", label: "No tag", bg: "bg-transparent", text: "text-black/90" },
    { id: "phong-ctsv", label: "Phòng CTSV", bg: "bg-blue-600", text: "text-white" },
    { id: "phong-dao-tao", label: "Phòng Đào tạo", bg: "bg-emerald-600", text: "text-white" },
    { id: "phong-khtc", label: "Câu hỏi", bg: "bg-amber-500", text: "text-black" },
];

// Helper to safely get flair styles when rendering posts
export const getFlairStyle = (tagName: string) => {
    const flair = tag_options.find((f) => f.label === tagName);
    return flair ? `${flair.bg} ${flair.text}` : "bg-transparent text-black"; // Fallback style
};