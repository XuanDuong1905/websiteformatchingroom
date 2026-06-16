import { redirect } from "next/navigation";

type RoomDetailRedirectProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RoomDetailRedirect({ params }: RoomDetailRedirectProps) {
  const { id } = await params;
  redirect(`/room/${id}`);
}
