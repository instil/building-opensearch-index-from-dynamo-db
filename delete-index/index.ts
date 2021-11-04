import {deleteIndex} from "../service/OpenSearchClient";

export const handler = async (): Promise<void> => {
    console.log("Received event to delete your index index");
    await deleteIndex();
};
