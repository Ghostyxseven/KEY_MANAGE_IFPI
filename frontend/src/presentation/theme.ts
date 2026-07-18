export const colors = {
  brand: "#123C69", brandDark: "#0B294A", brandSoft: "#EAF2FA", accent: "#D69E2E",
  background: "#F4F7FA", surface: "#FFFFFF", text: "#142033", muted: "#64748B",
  border: "#DCE4EC", success: "#17805C", successSoft: "#E7F6F0",
  danger: "#C2414B", dangerSoft: "#FCECEF", warning: "#A16207", warningSoft: "#FEF3C7",
} as const;

export const shadows = { card: { shadowColor: "#0B294A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 } };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 10, md: 14, lg: 20, pill: 999 } as const;
export const layout = { contentMaxWidth: 1120, formMaxWidth: 560, pagePadding: 20 } as const;
