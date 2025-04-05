export type Claims = {
  userId: string;
  username: string;
};

export type AppJwtPayload = {
  claims: Claims;
};
