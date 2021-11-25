import {indexDocument, deleteDocument} from "./OpenSearchClient";
import {User} from "../database/user/User";

export async function removeDocumentFromOpenSearch(
  partitionKey: string | undefined,
  sortKey: string | undefined
): Promise<void> {
  if (!partitionKey || !sortKey) {
    console.error("Error: either partition key or sort key is undefined");
    return;
  }

  const documentId = `${partitionKey}_${sortKey}`;
  console.log("Deleting document from OpenSearch with id:", documentId);

  await deleteDocument(documentId);
}

export async function indexDocumentInOpenSearch(
  user: User,
  partitionKey: string | undefined,
  sortKey: string | undefined
): Promise<void> {
  if (!partitionKey || !sortKey) {
    console.error("Error: either partition key or sort key is undefined");
    return;
  }

  const documentId = `${partitionKey}_${sortKey}`;
  console.log("Indexing document in OpenSearch with id:", documentId);

  await indexDocument(documentId, user);
}

