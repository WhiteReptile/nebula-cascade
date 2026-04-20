/**
 * Thirdweb client — shared singleton.
 * Client ID is public (safe to commit, frontend-exposed).
 */
import { createThirdwebClient } from 'thirdweb';

export const THIRDWEB_CLIENT_ID = '0ee0974906e5b6b9d18c8f635d4a3df0';

export const thirdwebClient = createThirdwebClient({
  clientId: THIRDWEB_CLIENT_ID,
});
