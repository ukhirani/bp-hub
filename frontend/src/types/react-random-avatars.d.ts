declare module "react-random-avatars" {
  import type { FC } from "react";

  export type RandomAvatarProps = {
    name?: string;
    size?: number;
    square?: boolean;
  };

  export const RandomAvatar: FC<RandomAvatarProps>;
}
