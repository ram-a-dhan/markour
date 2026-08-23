/**
 * Wire format: dates become epoch-ms numbers so the client (fetch/JSON)
 * only ever deals with plain numbers, never Date (de)serialization.
 */

export const serializeUser = (row: IUserBE): IUserFE => {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    picture: row.picture,
    createdAt: row.createdAt.getTime(),
  };
};

export const serializeNote = (row: INoteBE): INoteFE => {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    content: row.content,
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
    deletedAt: row.deletedAt ? row.deletedAt.getTime() : null,
    version: row.version,
  };
};
