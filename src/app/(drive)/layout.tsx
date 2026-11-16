import { redirect } from "next/navigation";

export default function DriveLayout({ children }: { children: React.ReactNode }) {
	redirect("/inbox");
	return <>{children}</>;
}
