import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: "h6d3bgzy",
  dataset: "production",
  apiVersion: "2021-08-31",
  useCdn: true,
});

export default client;
