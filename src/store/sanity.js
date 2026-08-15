import { createClient } from "@sanity/client";

export const client = createClient({
  apiVersion: "2021-08-31",
  dataset: "production",
  projectId: "h6d3bgzy",
  useCdn: true,
});

export default client;
