export type UseTableParams = {
  page: number;
  pageSize?: number;
  filter?: string;
};

export type TableResponse = {
  data: Data[];
  total: number;
};

export type Data = {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
};
