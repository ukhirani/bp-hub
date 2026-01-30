import { useParams } from "react-router-dom";

import NotFound from "./NotFound";


export default function Profile() {
  const { id } = useParams<{ id: string  }>();

  if (!id) {
    return <NotFound >Profile not found</NotFound>;
  }

  return <div>Profile{ id ? `: ${id}` : '' }</div>;
}
