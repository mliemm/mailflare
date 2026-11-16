export type ThemePreference = "light" | "dark" | "black" | "system";

export const THEME_STORAGE_KEY = "mailflare-theme";
export const THEME_CHANGED_EVENT = "mailflare:theme-changed";

// Runs in <head> before paint, so the first frame already has the right theme (same approach as the
// sidebar width). Keep it in sync with resolveTheme/applyTheme below.
export const themeBootstrapScript = `(() => {
	try {
		const saved = localStorage.getItem("mailflare-theme");
		const preference = saved === "light" || saved === "dark" || saved === "black" ? saved : "system";
		const dark = preference === "dark" || preference === "black" || (preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
		const root = document.documentElement;
		root.classList.toggle("dark", dark);
		root.classList.toggle("black", preference === "black");
		root.classList.toggle("light", !dark);
		const meta = document.querySelector('meta[name="theme-color"]');
		if (meta) meta.setAttribute("content", preference === "black" ? "#000000" : dark ? "#202124" : "#f6f8fc");
	} catch {}
})();`;

export function isThemePreference(value: unknown): value is ThemePreference {
	return value === "light" || value === "dark" || value === "black" || value === "system";
}

export function readThemePreference(): ThemePreference {
	if (typeof window === "undefined") return "system";
	try {
		const saved = localStorage.getItem(THEME_STORAGE_KEY);
		return isThemePreference(saved) ? saved : "system";
	} catch {
		return "system";
	}
}

export function resolveTheme(preference: ThemePreference): "light" | "dark" {
	if (preference === "black") return "dark";
	if (preference !== "system") return preference;
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(preference: ThemePreference): void {
	if (typeof document === "undefined") return;
	const dark = resolveTheme(preference) === "dark";
	const root = document.documentElement;
	root.classList.toggle("dark", dark);
	root.classList.toggle("black", preference === "black");
	root.classList.toggle("light", !dark);
	const meta = document.querySelector('meta[name="theme-color"]');
	if (meta) meta.setAttribute("content", preference === "black" ? "#000000" : dark ? "#202124" : "#f6f8fc");
}

export function saveThemePreference(preference: ThemePreference): void {
	try {
		if (preference === "system") localStorage.removeItem(THEME_STORAGE_KEY);
		else localStorage.setItem(THEME_STORAGE_KEY, preference);
	} catch {
		// Storage can be unavailable in private windows; the theme still applies for this page.
	}
	applyTheme(preference);
	if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(THEME_CHANGED_EVENT, { detail: preference }));
}
