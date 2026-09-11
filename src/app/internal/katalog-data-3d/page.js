import { getServerSession } from "next-auth";
import KatalogData3D from "./KatalogData3D";
import getData from "./lib/data";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const page = async () => {
  const session = await getServerSession(authOptions);
  const data = await getData(session.accessToken);
  return (
    <KatalogData3D data={data}/>
  )
}

export default page;